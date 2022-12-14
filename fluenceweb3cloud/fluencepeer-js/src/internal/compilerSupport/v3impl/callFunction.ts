import { FnConfig, FunctionCallDef } from './interface';
import { FluencePeer } from '../../FluencePeer';
import { Fluence } from '../../../index';
import { Particle } from '../../Particle';
import {
    injectRelayService,
    argToServiceDef,
    registerParticleScopeService,
    responseService,
    errorHandlingService,
    ServiceDescription,
    userHandlerService,
    injectValueService,
} from './services';

/**
 * Convenience function to support Aqua `func` generation backend
 * The compiler only need to generate a call the function and provide the corresponding definitions and the air script
 *
 * @param rawFnArgs - raw arguments passed by user to the generated function
 * @param def - function definition generated by the Aqua compiler
 * @param script - air script with function execution logic generated by the Aqua compiler
 */
export function callFunction(rawFnArgs: Array<any>, def: FunctionCallDef, script: string) {
    if (def.arrow.domain.tag !== 'labeledProduct') {
        throw new Error('Should be impossible');
    }

    const argumentTypes = Object.entries(def.arrow.domain.fields);
    const expectedNumberOfArguments = argumentTypes.length;
    const { args, peer, config } = extractArgs(rawFnArgs, expectedNumberOfArguments);

    if (args.length !== expectedNumberOfArguments) {
        throw new Error('Incorrect number of arguments. Expecting ${def.argDefs.length}');
    }

    const promise = new Promise((resolve, reject) => {
        const particle = peer.internals.createNewParticle(script, config?.ttl);

        if (particle instanceof Error) {
            return reject(particle.message);
        }

        for (let i = 0; i < expectedNumberOfArguments; i++) {
            const [name, type] = argumentTypes[i];
            let service: ServiceDescription;
            if (type.tag === 'arrow') {
                service = userHandlerService(def.names.callbackSrv, [name, type], args[i]);
            } else {
                service = injectValueService(def.names.getDataSrv, name, type, args[i]);
            }
            registerParticleScopeService(peer, particle, service);
        }

        registerParticleScopeService(peer, particle, responseService(def, resolve));

        registerParticleScopeService(peer, particle, injectRelayService(def, peer));

        registerParticleScopeService(peer, particle, errorHandlingService(def, reject));

        peer.internals.initiateParticle(particle, (stage) => {
            // If function is void, then it's completed when one of the two conditions is met:
            //  1. The particle is sent to the network (state 'sent')
            //  2. All CallRequests are executed, e.g., all variable loading and local function calls are completed (state 'localWorkDone')
            if (isReturnTypeVoid(def) && (stage.stage === 'sent' || stage.stage === 'localWorkDone')) {
                resolve(undefined);
            }

            if (stage.stage === 'sendingError') {
                reject(`Could not send particle for ${def.functionName}: not connected  (particle id: ${particle.id})`);
            }

            if (stage.stage === 'expired') {
                reject(`Request timed out after ${particle.ttl} for ${def.functionName} (particle id: ${particle.id})`);
            }

            if (stage.stage === 'interpreterError') {
                reject(
                    `Script interpretation failed for ${def.functionName}: ${stage.errorMessage}  (particle id: ${particle.id})`,
                );
            }
        });
    });

    return promise;
}

const isReturnTypeVoid = (def: FunctionCallDef) => {
    if (def.arrow.codomain.tag === 'nil') {
        return true;
    }

    return def.arrow.codomain.items.length == 0;
};

/**
 * Arguments could be passed in one these configurations:
 * [...actualArgs]
 * [peer, ...actualArgs]
 * [...actualArgs, config]
 * [peer, ...actualArgs, config]
 *
 * This function select the appropriate configuration and returns
 * arguments in a structured way of: { peer, config, args }
 */
const extractArgs = (
    args: any[],
    numberOfExpectedArgs: number,
): {
    peer: FluencePeer;
    config?: FnConfig;
    args: any[];
} => {
    let peer: FluencePeer;
    let structuredArgs: any[];
    let config: any;
    if (FluencePeer.isInstance(args[0])) {
        peer = args[0];
        structuredArgs = args.slice(1, numberOfExpectedArgs + 1);
        config = args[numberOfExpectedArgs + 1];
    } else {
        peer = Fluence.getPeer();
        structuredArgs = args.slice(0, numberOfExpectedArgs);
        config = args[numberOfExpectedArgs];
    }

    return {
        peer: peer,
        config: config,
        args: structuredArgs,
    };
};
