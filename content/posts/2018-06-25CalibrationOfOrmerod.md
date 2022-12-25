---
title: " Calibration of Ormerod"
date: "2018-06-23"
---

The aim is to calibrate the Ormerod so that I can accurately print meshing gears for my BluRay Robot.  My current version
doesn't work well enough.

I also want to explore using the stepper motor limit currents to allow probing of the extruder.  I am assuming that the
limiting current is proportional to the force.


#  Good Prints
Requires both Slic3r settings and RepRap firmware settings to agree as well as be calibration to actual hardware
and to the filament.

# Motor Currents and stall detection
The new duet hardware and firmware is able to detect and log motor stall currents.  It also allows the motor
current to be reduced by a proportional amount from the maximum that is set in the sys/config.g file as `M906`


# Stage 1 the Extruder

- ***Filament*** All these experiments are done with Red Translucent PETG from www.real-filament.com.  Relatively reasonable price,
free delivery by Amazon and quality seems ok so far.
- ***Nozzle*** E3D 0.25 mm
- ***DuetWifi on 2.0 firmware***
- ***Filament*** Ormerod 1 as modified by H3  
- ***Settings file*** As you change the settings file you vary the effect of the extrusion.

## 1a Empty extruder

Taking off the bowden tube and zeroing the filament allows you to test the extruder length and required currents.

### First try to find lower limit load

First remove the cold extrusion limit.  Currently the extruder is set to a limit of 1.2A. I have found that althougth
the driver can do up to 1.8 to 2A the stepper motor gets very hot.  I had to use a high current with a worn gears and a
bad filament path.

1. Starting condition make sure extruder works.  Bowden tube disconnnected. No load filament path.     
    - Remove cold extrusion limit by `M302 P1`, (`M302` reports current situation)  I think cold extrusion limit is 
    hardcoded to something like 160.
    - ![tick] Test can extrude and retract 10mm. Which I can (although response not instanteous, maybe WIFI problem) 
2. Try out reducing feed current and logging stall
    - Log stalls on Extruder.  Hit first snag, the extruder doesn't appear to be a valid motor `M915 E S10 F0 R1`  This
    seems to be ok but not sure.
    -  Reduce current, set extruder 0 to 5% of normal current `M913 E5`
    - Tried at high current and just go humming noise ![tick]
3. Try and read the log
    - See [logging page].
    - Set logging on `M929 P"extruderLog.txt" S1` and rerun extrude but only 10mm this time.  Get short hum
    - Extruder log says logging has started but there is no log. ![cross] . So the logging hasn't worked
    - Turn loggin off and just use the hum.  Also planning to change the macro files for quick testing.
    - ![cross] gave up macro as need to take sd card out.
    - Turn logging off `M929 S0`
4 Test no load at 15mm/sec
    - Use binary chop of extruder current - Extruder set to 1.2A

Load | Direction | Result
-----|-----------|-------
5%   | Extrude   | ![cross]
30%  | Extrude   | ![tick]
17%  | Extrude   | Stuttering
23%  | Extrude   | ![tick]
20%  | Extrude   | Stuttering
22%  | Extrude   | ![tick]
21%  | Extrude   | Stuttering
22%  | Extrude   | ![tick]
22%  | Retract   | ![tick]
21%  | Retract   | ![tick]
17%  | Retract   | Stutter
18%  | Retract   | ![tick]

**Result Extrude 22%, Retract 18%**

5 Retest at 5mm/sec, 24C
   
Load | Direction | Result
-----|-----------|-------
17%  | Extrude   | ![tick]
13%  | Extrude   | ![tick]
8%   | Extrude   | Stutter barely audible
11%  | Extrude   | Stutter barely audible
12%  | Extrude   | Stutter barely audible
13%  | Extrude   | ![tick]
11%  | Retract   | ![cross]
12%  | Retract   | ![cross]
13%  | Retract   | ![tick]

**Result Extrude 13%, Retract 13%**
    

6 Retest at 60mm/sec, 24C
   
Load | Direction | Result
-----|-----------|-------
13%  | Extrude   | ![cross]
28%  | Extrude   | Stutter
32%  | Extrude   | ![tick]
30%  | Extrude   | ![tick]
29%  | Extrude   | Stutter but not evenly
29%  | Retract   | ![tick]
25%  | Retract   | ![tick]
21%  | Retract   | ![cross]
23%  | Retract   | ![tick]
22%  | Retract   | ![tick]

**Result Extrude 29%, Retract 22%**

## Test effect of unwinding and path

Need longer sections of filament so will test 100mm.  Can also use to measure length.  
Only need to measure extrusion.   
100mm at 60mm/sec at 24C

Load | Direction | Result
-----|-----------|-------
29%  | Extrude   | ![cross] fails when needs to unwrap from PrintDry
32%  | Extrude   | Stutter
33%  | Extrude   | Stutter
35%  | Extrude   | Occasional Stutter
36%  | Extrude   | Occasional Stutter
38%  | Extrude   | ![tick]

Length 98.7, 98.68
Diameter 1.73,1.75,1.73

## Now taking path on top

Load | Direction | Result
-----|-----------|-------
38%  | Extrude   | ![tick]

Length 98.9

# Going to tweak gearing calibration

Extrusion at 15mm/sec 100mm
- Changed gearing from 4000 to 4053 = 4000 * 100 / 98.7.  
- Rebooted and need to remove cold extrusion limit again `M302 P1`
- ![cross] ![cross]  Changed the Z axis
- Changed gearing from 420 to 426.0 = 420 * 100 / 98.6  
- Measured length 99.8, 100.12

# X axis stall

Trying lots of variations but cannot get stallguard to work.

Just checking to convert steps/second to mm/min so in the X axis    
F1000 = 1000mm/min = 16.7 mm/sec    
M92 for X is set at 87 steps/mm so 16.7 mm/sec = 1450 steps / sec.    
For stall guard it needs to be above 200.

## Trying higher sensitiviy
Sensitivity ranges from -64 to + 63, not recommended to go below -10 but going to try most sensitive
to see if it will trigger at all.

![cross]  Nice idea but I can't get stallguard to work ![cross]   
**Ooops**  Axes on Duet Wifi are not numbered in squence so I was using setting Stallguard on P2 that I thought was X


[tick]: images/check16.png
[cross]: images/delete16.png
[logging page]: https://duet3d.dozuki.com/Wiki/Logging


# New features

* Stall detection  M915
* Pressure Advance?

# 2018-06-29 Update
Have turned off pausing on stall (M915) and have turned on logging.  Also boosted X axis current from 800 to 900 mA
Y axis still at 1200mA.   

Nozzle is 0.4mm (I thought I had installed 0.25, however extrusion settings were set for a 0.4mm nozzle)

## Going to create calibration first layer
Tests both extrusion of first layer and also correct bed height.

### First sample
eg square single layer thickness and then a a quaer double layer, and 1/8th triply layer and then 5mm lever to take off 
surface easily.   

Looking to see if get even fill

Then print at different temperatures to test adherence and quality.

First layer height is 0.4mm and subsequent are 0.2mm.

Z calibration displayed 1.4 measured 1mm +-0.3mm using cards.   

2016-06-29  Too high - as bottom not all shiny (some dull patches)
Under extrusion as when bend it, breaks into harp like threads ( in parts)

Can half height of square tower grip from 5mm to 2.5mm, nice to have something to hold onto. Also reduce from 
3 layers to 2 layers thick.



# Calibration 2
The first time I really focused on the extruder, I have since changed gears and think the problem was with the gears
so probably worth revisiting.  The current plan is to:

- Measure filament (need calipers)
- Do temperature calibration
- Do thinwall calibration
- Do calibration print
- do Fit check

## Temperature calibration

Going to use a [tower block from Eibwen][].

(testing python [GCODE modifier][])   

[GCODE modifier]:(https://www.thingiverse.com/thing:1579403/files)   

- Downloaded the stl file into `C:\Users\HumphreyDrummond\CloudStation\A Letter-2018\2018-11-14 3d temperature calibration`
- Need to download the OpenScad file for temperature range you are using as their are letters on the
model.
- Imported into Slic3r
- created new filament for Blue PLA that I am using
    - 1.75mm
    - 190-220 C
    
- 
    


[tower block from Eibwen]:(https://www.thingiverse.com/thing:915435)



## Nozzle / filament calibration
Here is a quote that nozzle diameter may not be that important:

https://reprap.org/forum/read.php?1,113374,113953

Calibration is by single wall vase and measeuing wall thickenss.  

   
