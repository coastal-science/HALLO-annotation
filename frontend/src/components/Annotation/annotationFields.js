const SIS_options = [
    { id: 1, value: "KW", description: "Killer whale" },
    { id: 2, value: "KW?", description: "potential killer whale (if it was unknown but had the potential to be KW, it fell into this category)" },
    { id: 3, value: "HW", description: "Humpback whale" },
    { id: 4, value: "HW?", description: "potential humpback whale (certainly not a KW, possibly  a HW)" },
    { id: 5, value: "HW/KW?", description: "either HW or KW, cannot determine" },
    { id: 6, value: "PWSD", description: "Pacific White Sided Dolphin" },
    { id: 7, value: "PWSD?", description: "potential Pacific White Sided Dolphin" },
    { id: 8, value: "KW/PWSD?", description: "either KW or PWSD, too faint or indistinct to determine" },
    { id: 9, value: "GW", description: "Grey Whale" },
    { id: 10, value: "GW?", description: "potential Grey Whale" },
    { id: 11, value: "HW/GW?", description: "either HW or GW, cannot determine without further review" },
    { id: 12, value: "Odontocete", description: "vocalizations from a small unidentified odontocete, not PWSD" },
    { id: 13, value: "Odontocete?", description: "potential vocalizations from a small unidentified odontocete, not PWSD" },
    { id: 14, value: "Rissos", description: "Risso’s Dolphin" },
    { id: 15, value: "SPW", description: "Sperm Whale" },
    { id: 16, value: "Vessel Noise", description: "Vessel Noise" },
    { id: 17, value: "Clang", description: "some metallic-like anthropogenic clang with unknown source" },
    { id: 18, value: "Mooring", description: "noise likely derived from the instrument’s mooring equipment" },
    { id: 19, value: "Sonar", description: "Noise likely due to sonar activity" },
    { id: 20, value: "UNK", description: "Unknown - unable to identify or attribute sound to a definitive class" },
];

const kw_ecotype_options = [
    { id: 1, value: "SRKW", description: "Southern Resident Killer Whale" },
    { id: 2, value: "NRKW", description: "Northern Resident Killer Whale" },
    { id: 3, value: "TKW", description: "Transient (Bigg’s) Killer Whale" },
    { id: 4, value: "UKW", description: "Outercoast Transient (Bigg’s) Killer Whale" },
    { id: 5, value: "OKW", description: "Offshore Killer Whale" },
    { id: 6, value: "Unknown", description: "unable to identify or attribute sound to a definitive class" },
];

const pod_options = [
    { id: 1, value: "J", description: "J pod" },
    { id: 2, value: "K", description: "K pod" },
    { id: 3, value: "L", description: "L pod" },
    { id: 4, value: "Unknown", description: "unable to identify or attribute sound to a definitive pod" },
    { id: 5, value: "K/L", description: "K or L pod (because of the call types they have in common)" },
];

const signal_type_options = [
    { id: 1, value: "PC", description: "Pulsed call" },
    { id: 2, value: "W", description: "Whistle" },
    { id: 3, value: "CK", description: "(Echolocation) click" },
    { id: 4, value: "Unknown", description: "unable to identify or attribute sound to a definitive signal type" },
];

const call_type_options = [
    { id: 1, value: "S01/S02", description: "S01 or S02 call (attribution uncertain)" },
    { id: 2, value: "Unknown", description: "unable to identify or attribute sound to a definitive call type" },
];

const confidence_options = [
    { id: 1, value: "High" },
    { id: 2, value: "Medium" },
    { id: 3, value: "Low" },
];

export { SIS_options, kw_ecotype_options, pod_options, signal_type_options, call_type_options, confidence_options };