## Kurzbeschreibung
Bei Adrian Grande und Barb Marley geht es darum, herauszufinden, wie vielfältig die Musik auf Radio Energy Bern in Hinsicht auf die Geschlechter der Artists ist. 
Jedes Lied welches auf Energy lief, wurde als Eintrag in meiner Datenbank gespeichert. Die Einträge sind durch eine zweite API gelaufen, um das jeweilige Geschlecht der Künstler:innen zu ermitteln und dieses anschliessend den Datensätzen hinzuzufügen. Das interaktive Chart sowie die beiliegenden Aussagen zeigen, welches Geschlecht vergleichsweise am meisten in der gewählten Woche gespielt wurde. Die drei Lieder die am meisten gespielt wurden, sind jeweils aufgelistet und mit Geschlecht des Artists und der Anzahl, wie oft das Lied in einer Woche gespielt wurde, versehen.

## Learnings
Als wichtigstes Learning nehme ich mit, mir gut zu überlegen, was für ein Projekt ich machen möchte - und ob es überhaupt umsetzbar ist. Ich habe viel Zeit damit verbracht nach einer API zu suchen, die mir ein spannendes Projekt ermöglicht. Dabei habe ich aber vernachlässigt die Zuverlässigkeit und vor allem die Rate-Limits der API im Kopf zu behalten. So lädt die Seite jetzt erstmal sehr lange, da die beste kostenlose API, die ich finden konnte, ein zu niedriges Rate-Limit pro Minute hat, woran das Projekt und dessen UX leidet.

## Schwierigkeiten
Die größte Herausforderung bestand bei mir darin, die Interaktivität des Charts zum Funktionieren zu bringen. Als ich noch keinen Date Picker hatte wurde das Chart problemlos angezeigt, nach dem Einbauen des Date Pickers musste ich jedoch fast mein ganzes JS File umstrukturieren, was mich einiges an Zeit gekostet hat. 

## Ressourcen
Ich habe viel mit ChatGPT in VS Code gearbeitet. Vor allem bei Funktionen, aber auch bei kleinen Sachen wie beispielsweise beim Datum umformulieren, war es mir eine grosse Hilfe. In Figma habe ich mehrere Plugins & Widgets benutzt. Mit “I Charts Generate“ konnte ich effizient mein Chart designen, “Music Data” lieferte mir Albumcover und die benutzten Icons sind von “SWM Icon Pack”.