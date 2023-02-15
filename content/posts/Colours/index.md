---
title: "Tartan Colours"
date: 2023-01-22
slug: colours
---

Lists of tartan colours are important for a dictionary as you need to allow some variation for colours and yet still be the same thread count descriptions.

In the first instance I am using the 19 colour names from the Tartan Registry although I am very tempted to using on the 6 basic colours that are common to almost all languages White Black, Red, Green, Blue and Yellow.

## Tartan Registry Colour list

The full tartan registry colour list (corrected for errors as of 2023-01-23) is:

{{< colour_table >}}

## Colour conversion sites from Pantone to sRGB

Pantone don't publish all their colours on the web so require you to log into their web site.
There are a number of sites on the web that puport to offer Pantone colours but they seem to
be off from the ones the Pantone do advertise, eg Pantone 2728 C. They also don't tend to
specify if they are uncoated or coated colours.

[ediy][] reports the exact same colours that [Pantone-colours][] do. They seem closer to the uncoated Pantone colours
but still quite a bit different. The following seem to have different values [qconv][] and [Ramweb][]

[qconv]: https://qconv.com/en/convert-pantone-to-rgb
[ediy]: https://www.ediy.co.nz/pantone-to-rgb
[ramweb]: http://www.ramwebsolutions.com/colors/pantone.php
[pantone-colours]: http://www.pantone-colours.com/

| Colour       | [qconv][]           | [Ramweb][]          | [Pantone-colours][] |
| ------------ | ------------------- | ------------------- | ------------------- |
| Pantone 160  | {{< c "#AF4200" >}} | {{< c "#9E5205" >}} | {{< c "#9E540A" >}} |
| Pantone 180  | -                   | -                   | {{< c "#C13828" >}} |
| Pantone 654  | -                   | -                   | {{< c "#0F2B5B" >}} |
| Pantone 543  | -                   | -                   | {{< c "#93B7D1" >}} |
| Pantone 364  | -                   | -                   | {{< c "#3A7728" >}} |
| Pantone 2728 |                     |                     | {{< c "#3044b5" >}} |

[e-paint]: https://www.e-paint.co.uk/lab-hlc-rgb-lrv-values.asp
[theembroiderynerd]: https://theembroiderynerd.com/pantone-thread-chart/

[e-paint][] seems a much better website with matching for a variety of different colour systems. Note the [theembroiderynerd][] also seems to have
colours that match the C versions.

Pantone publish 2728C as {{< c "#0047bb" >}} on [their website] (as of 2023-02-15)

[their website]: https://www.pantone.com/pantone-connect

| Colour | Uncoated            | Coated              |
| ------ | ------------------- | ------------------- |
| 160    | {{< c "#A16A47" >}} | {{< c "#A5551D" >}} |
| 180    | {{< c "#C26158" >}} | {{< c "#C23C33" >}} |
| 2728   | {{< c "#4f69c1" >}} | {{< c "#0047bb" >}} |
| 654    | {{< c "#55688B" >}} | {{< c "#003A70" >}} |
| 543    | {{< c "#79AAD2" >}} | {{< c "#A4C7E2" >}} |
| 364    | {{< c "#5B794E" >}} | {{< c "#49762A" >}} |

Note these colours are using the sRGB conversion system used is IEC 61966:2-1 1999 D50 adapted which may differ from other conversions.

I am planning where possible to use the C versions of colours, where pantone colours are stated.
