var config = module.exports;

config["My tests"] = {
    environment: "node",
    rootPath : "../",
    tests:[ 
        "test/*.js"
    ],
    extensions: [require("./buster-chado")]
};
