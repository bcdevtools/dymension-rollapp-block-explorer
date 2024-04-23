export const paymentSettings = {
    receiver: {
        cosmosAddress: "dym1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp7vezn",
        evmAddress: "0x0000000000000000000000000000000000000000"
    },
    fee: {
        token1: {
            exponent: 6,
            denom: "ibc/5620289B0E1106C8A2421F212FEC4EB19E3CBA964662DB61754CCDE8FAAC29FF",
            registration: 10, // amount of token
            extends: {
                // amount of token for X days
                7: 10,
                30: 25,
                90: 70
            },
            storageExpands: {
                // amount of token for X days
                28: 100,
                91: 1000,
                182: 10000,
            }
        }
    }
};