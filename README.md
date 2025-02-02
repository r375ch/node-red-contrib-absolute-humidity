Calculates the absolute humidity and dew point for a given relative humidity and air temperature.
    
### Inputs
  
`msg.relativeHumidity` (number)	: the relative humidity [%]

`msg.temperature (number)`	: the air temperature [°C]

### Out

`msg.absoluteHumidity` (number)	: the absolute humidity [g/m³], rounded to one decimal place

`msg.dewPoint` (number)		: the dew point [°C], rounded to one decimal place

### Details
    
The received message shall contain two properties:
    
`relativeHumidity` is a measure of the amount of water vapor present in the air compared to the maximum amount of vapor the air can hold at its current temperature. It is expressed as a percentage [%].

`temperature` represents the current air temperature, measured in degrees Celsius [°C].

Based on these two measures, the node calculates two additional properties, which are stored in the outgoing message:

`absoluteHumidity` quantifies the actual amount of water vapor in the air, independent of air temperature. It is measured in grams of water per cubic meter of air [g/m³].

The dew point `dewPoint` indicates the temperature to which air must be cooled to become saturated with water vapor. As the air cools, its ability to hold moisture decreases. If it is cooled below the dew point, water vapor will condense into liquid water. This can lead to the formation of water (dew) on surfaces when the air comes into contact with a cooler object. The dew point is measured in degrees Celsius [°C].
    
### References

 -  https://www.wetterochs.de/wetter/feuchte.html
