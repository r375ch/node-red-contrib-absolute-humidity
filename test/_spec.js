var should = require("should");
var helper = require("node-red-node-test-helper");
var hummyNode = require("../src/absolute-humidity.js");

var flow = [{ id: "n1", type: "absolute-humidity", name: "test name", temperatureTopic: "temp", humidityTopic: "hum", wires:[["n2"]] },
	    { id: "n2", type: "helper" }];

helper.init(require.resolve('node-red'));

describe('absolute-humidity Node with Wetterochs Formula', function () {
    
    afterEach(function () {
	helper.unload();
    });
    
    it('should be loaded with Wetterochs formula', function (done) {
	helper.load(hummyNode, [{ id: "n1", type: "absolute-humidity", name: "test name", formula: "wetterochs"}], function () {
	    var n1 = helper.getNode("n1");
	    n1.should.have.property('name', 'test name');
	    n1.should.have.property('formula', 'wetterochs');
	    done();
	});
    });
    
    it('should preserve original message properties with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('originalValue', 42);
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.96);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 20.0, relativeHumidity: 75, originalValue: 42 });
        });
    });

    it('should not output with only temperature input with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ temperature: 20.0 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should not output with only humidity input with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ relativeHumidity: 75 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should reject humidity values below 0% with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -5% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: -5 });
        });
    });

    it('should reject humidity values above 100% with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: 101% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: 101 });
        });
    });

    it('should reject invalid humidity via topic with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -1% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ topic: "hum", payload: -1 });
        });
    });

    it('should reject invalid humidity via datapoint with Wetterochs formula', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -1% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ datapoint: "HUMIDITY", payload: -1 });
        });
    });

    it('should create correct result for T=20°C and r=75% with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.43);
		    msg.should.have.property('absoluteHumidity', 12.96);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 20.0, relativeHumidity: 75 });
	});
    });

    it('should create correct result for T=10°C and r=20% with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', -11.89);
		    msg.should.have.property('absoluteHumidity', 1.88);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 10.0, relativeHumidity: 20 });
	});
    });
    
    it('should create correct result for T=0°C and r=100% with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 0);
		    msg.should.have.property('absoluteHumidity', 4.85);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 0, relativeHumidity: 100 });
	});
    });

    it('should create correct result for T=-10°C and r=50% with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', -18.44);
		    msg.should.have.property('absoluteHumidity', 1.18);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: -10, relativeHumidity: 50 });
	});
    });

    it('should reject lower temperature outside Wetterochs range (-45°C to 60°C)', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("-46°C not valid for Wetterochs (-45-60°C)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: -46, relativeHumidity: 50 });
        });
    });
    
    it('should reject upper temperature outside Wetterochs range (-45°C to 60°C)', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("61°C not valid for Wetterochs (-45-60°C)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 61, relativeHumidity: 50 });
        });
    });

    // Test topic-based input
    it('should handle topic-based input correctly and preserve properties with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");
            var msgCount = 0;

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.43);
		    msg.should.have.property('absoluteHumidity', 12.96);
                    msg.should.have.property('originalValue', 42);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature and humidity with configured topics
	    n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
	    n1.receive({ topic: "hum", payload: 75, originalValue: 42 });
	});
    });

    // Test datapoint-based input
    it('should handle datapoint-based input correctly and preserve properties with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.43);
		    msg.should.have.property('absoluteHumidity', 12.96);
                    msg.should.have.property('originalValue', 42);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature and humidity with datapoint identifiers
	    n1.receive({ datapoint: "ACTUAL_TEMPERATURE", payload: 20.0, originalValue: 42 });
	    n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 42 });
	});
    });

    // Test mixed input methods
    it('should handle mixed input methods correctly and preserve properties with Wetterochs formula', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.43);
		    msg.should.have.property('absoluteHumidity', 12.96);
                    msg.should.have.property('originalValue', 45);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature via topic and humidity via datapoint
	    n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
	    n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 45 });
	});
    });
});

describe('absolute-humidity Node with Lawrence Formula', function () {
    
    afterEach(function () {
        helper.unload();
    });
    
    it('should be loaded with Lawrence formula', function (done) {
        helper.load(hummyNode, [{ id: "n1", type: "absolute-humidity", name: "test name", formula: "lawrence" }], function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            n1.should.have.property('formula', 'lawrence');
            done();
        });
    });
    
    // Flow with Lawrence formula
    var lawrenceFlow = [
        { id: "n1", type: "absolute-humidity", name: "test name", temperatureTopic: "temp", humidityTopic: "hum", formula: "lawrence", wires:[["n2"]] },
        { id: "n2", type: "helper" }
    ];
    
    it('should preserve original message properties with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('originalValue', 42);
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.93);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 20.0, relativeHumidity: 75, originalValue: 42 });
        });
    });

    it('should not output with only temperature input with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ temperature: 20.0 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should not output with only humidity input with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ relativeHumidity: 75 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should reject humidity values below 0% with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -5% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: -5 });
        });
    });

    it('should reject humidity values above 100% with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: 101% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: 101 });
        });
    });

    it('should reject invalid humidity via topic with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -1% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ topic: "hum", payload: -1 });
        });
    });

    it('should reject invalid humidity via datapoint with Lawrence formula', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Invalid humidity: -1% (OK: 0-100%)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ datapoint: "HUMIDITY", payload: -1 });
        });
    });

    it('should create correct result with Lawrence formula for T=20°C and r=75%', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.93);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 20.0, relativeHumidity: 75 });
        });
    });

    it('should create correct result with Lawrence formula for T=10°C and r=20%', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', -11.97);
                    msg.should.have.property('absoluteHumidity', 1.88);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 10.0, relativeHumidity: 20 });
        });
    });
    
    it('should create correct result with Lawrence formula for T=0°C and r=100%', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', 0);
                    msg.should.have.property('absoluteHumidity', 4.85);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 0, relativeHumidity: 100 });
        });
    });

    it('should create correct result with Lawrence formula for T=-10°C and r=50%', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', -18.47);
                    msg.should.have.property('absoluteHumidity', 1.18);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: -10, relativeHumidity: 50 });
        });
    });
    
    it('should reject lower temperature outside Lawrence range (-40°C to 50°C)', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("-41°C not valid for Lawrence (-40-50°C)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: -41, relativeHumidity: 50 });
        });
    });
    
    it('should reject upper temperature outside Lawrence range (-40°C to 50°C)', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("51°C not valid for Lawrence (-40-50°C)");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 51, relativeHumidity: 50 });
        });
    });
    
    // Test topic-based input
    it('should handle topic-based input correctly with Lawrence formula and preserve properties', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.93);
                    msg.should.have.property('originalValue', 42);
                    done();
                } catch(err) {
                    done(err);
                }
            });

            // Send temperature and humidity with configured topics
            n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
            n1.receive({ topic: "hum", payload: 75, originalValue: 42 });
        });
    });
    
    // Test datapoint-based input
    it('should handle datapoint-based input correctly with Lawrence formula and preserve properties', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.93);
                    msg.should.have.property('originalValue', 42);
                    done();
                } catch(err) {
                    done(err);
                }
            });

            // Send temperature and humidity with datapoint identifiers
            n1.receive({ datapoint: "ACTUAL_TEMPERATURE", payload: 20.0, originalValue: 42 });
            n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 42 });
        });
    });

    // Test mixed input methods
    it('should handle mixed input methods correctly with Lawrence formula and preserve properties', function (done) {
        helper.load(hummyNode, lawrenceFlow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('dewPoint', 15.43);
                    msg.should.have.property('absoluteHumidity', 12.93);
                    msg.should.have.property('originalValue', 45);
                    done();
                } catch(err) {
                    done(err);
                }
            });

            // Send temperature via topic and humidity via datapoint
            n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
            n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 45 });
        });
    });
});
