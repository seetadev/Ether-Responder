We are utilizing ZoraModuleManager, and ZoraProtocolFeeSettings in our our dapp and deploying it on Polygon after registering the Zora market module. We are developing a crowdsourcing marketplace using Zora's auction house template for enabling sharing of government assets like toll prepaid card, car details information for interstate travel, driving license management and quarterly pollution check and control. We are using the zora starter kit to access ZORA API, Creator Toolkit, and Marketplace Hyperstructure. Zora's Auction House template is being utilized for NFT marketplace of alarm clock wallpapers and background ringtones purchase and auction. We are also extending and adapting Turtle Music using NFT Experiments for music curators for alarm clock. We are using DAOtooling for coordination with a social focus around community collaboration for road incidents and alarms.

https://github.com/seetadev/Ether-Responder/tree/main/alarmviewer

Please find the video at https://drive.google.com/drive/folders/1bbHDoY1Y80EOeJP32XDngShnSjkMR55m (screencapturewithoutsound.mov file)

We are also using it for decentralized social sharing and road counselling at incident spot (please visit roadcounselingatincidents.mov)

# web3-music-subgraph

This is a fork of Spinamp's web3-music-subgraph that aggregates various web3 music platforms. The goal is to aggregate all web3 music into a single, highly normalized and queryable schema. 

- Running live [here](https://thegraph.com/hosted-service/subgraph/timdaub/web3musicsubgraph?version=current)

## Usage in neume-network

- We're currently using it in [neume-network/strategies](https://github.com/neume-network/strategies/tree/main/src/strategies/web3subgraph)

## Current Platforms

### Zora/Catalog
The [Zora](https://zora.co/) integration (which includes catalog) is sliced out from https://github.com/ourzora/zora-v1-subgraph and also just tracks plain ERC721 transfers with mints triggered based on the first transfer. With Zora, it does not seem possible to filter out for web3 music only using just on-chain data, so filtering non-music nfts out will likely happen in a post-processing phase.

### NOIZD
The [NOIZD](https://noizd.com/) integration is pretty simple, just tracking plain erc721 transfers, with mints triggered based on the first transfer.

### Sound.xyz
The [Sound.xyz](https://sound.xyz/) integration was sliced out of from https://github.com/soundxyz/subgraph. It tracks artist profile creation, edition and nft creation.

## License

See LICENSE file.
