---
title: "RGB Floodlights"
date: "2018-11-24"
---

Aim to cover RGB flood lights that can be sourced in the both the UK and France, should have
long term support by been made by named manufacturers.

# IP Ratings

[DSMT] have a useful description.

IP 6x is dust tight which is the minimium for outside use

Rating | Meaning
-------|--------
IP 65  | 6.3mm jets from any direction
IP 66  | 12.5mm jets from any direction
IP 66  | 1M submersion
IP 68  | beyond 1M eg Hermetically sealed

[DSMT]: (https://www.dsmt.com/resources/ip-rating-chart/)

# Table of Lamps
Lamp | Amazon UK | Amazon Fr | Manufacturer  | Watt | IP Rating | comment
-----|-----------|-----------|---------------|------|---------- |--------
Loftek 50W | [Loftec50WUK] £33 | [Loftec50WFr] N/A | Loftek | 50W | IP66 | RGBW, with TV type control
Loftek 30W |  | [Loftec50WFr] 23Eur | Loftek | 50W | IP66 | RGBW, with TV type control
Ustellar 60W | [Ustellar60UK] £36(min 2) | | | |  | IR credit card Controller
Ilux 10W |[Ilux10UK] £19 | |  | | | Mesh Bluetooth and app

[Loftec50WUK]:
[Loftec50WFr]:(https://www.amazon.fr/Projecteur-IP66-Projecteur-T%C3%A9l%C3%A9commande-lext%C3%A9rieur-Roulement/dp/B01L6PKJPI/ref=sr_1_14?ie=UTF8&qid=1543065714&sr=8-14&keywords=loftek)
[Ilux10UK]: https://www.amazon.co.uk/dp/B075QBL3J8?ref_=ams_ad_dp_ovrl

# Ustellar 60W RGB Flood lights

The unit looks quite good.  The cooling fins at the back look very thin.  In use the lamp was
not getting noticeably warm.
I took off the cover of the Unit by unscrewing 8 scres and you can see the insides:      
[USTellarRGB60W first dissasembly](USTellarRGB60W_cb70d7e8.png)

The silicone gasket looks like it has been made in a mold using quite a simple press.

Then detail of the potted electronics:   
[USTellarRGB60W potted electronics](a990218a.png)

The electronics are a combination switched mode PSU and current supply and presumably controller.

The reflector cover is held on by two screws and you can unscrew it easily.  The IR receiver is
held in at the bottom right hand corner by bent tab of the reflector.  After removal it looks
like this:   
[USTellarRGB60W removal of reflector](cf12f900.png)
There is a little space in the sides for adding electronics but since all potted I think quite tricky.

## Power consumption
Measured on a Uni-T clamp meter.  When turned off 11mA, with Red full on 77mA, Green 60mA,
Blue 64mA
White 190mA

Step down in brightness:

Power Level | Current White | Current Red
------------|---------------|------------
1  | 190mA | 77mA 
2  | 142mA | 60mA
3  | 95mA | 41mA
4 | N/A   | 29mA
50W == 250mA

## Use of Floods
Using these 60W floods in a single colour mode it seems you need them about every 5m for lighting trees
and 2-3M for the front of a house:

[Garden 3 floods in 10m](81c66512.png)

[Front house 2m](0bb1d380.png)


[Front of house 3m](741fc8cc.png)


# Wiring systems

There are various options in  order to have waterproof out
door wiring systems.  If it rains and surface water collects
you want to make sure the wiring is still safe and is not leaking
current to earth which would trip a RCCB.

- Household wiring protected in water proof boxes.  DriBox
manufacture boxes just for this purpose
- IEC 60309 blue water proof cables
- Waterproof cables on LED par lamps

# [IEC60309]

[IEC60309]:(https://en.wikipedia.org/wiki/IEC_60309)   

There are a two variants of these conectors re waterproofing
IP44 splashproof and IP67 water tight.  See here for a range
https://www.internationalconfig.com/catalog_pages/pg172.pdf

The colour denotes the voltage range, Blue is for 200-250V.

Most stuff sold is IP44 rated which is just about ok to keep
outside.   You can get some IP67 rated but mostly this will come
from China.


# Harmonised Cable standards


https://www.elandcables.com/electrical-cable-and-accessories/cables-by-standard/har-approved-cable 

