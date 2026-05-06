// diet: "veg" | "egg" | "non-veg"
// region: "north" | "south" | "bengali" | "gujarati" | "maharashtrian" | "punjabi" |
//         "kerala" | "goan" | "indo-chinese" | "continental" | "everyday"
// meals: subset of ["breakfast","lunch","dinner","snack"]
// spice/effort/heaviness: 1..3 (low/med/high)
// jain: true if onion/garlic/root-veg-free
// contains: optional ["dairy","gluten","nuts","onion-garlic","root"]
// ingredients: hero ingredients used by the excluded-ingredients filter

export const DISHES = [
  // North Indian veg
  { id: "rajma-chawal", name: "Rajma chawal", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 3, contains: ["onion-garlic"], ingredients: ["kidney beans","rice","onion","tomato"] },
  { id: "chole-bhature", name: "Chole bhature", region: "north", diet: "veg", jain: false, meals: ["lunch"], spice: 2, effort: 2, heaviness: 3, contains: ["gluten","onion-garlic"], ingredients: ["chickpeas","flour","onion"] },
  { id: "chana-masala-roti", name: "Chana masala + roti", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["chickpeas","wheat","onion"] },
  { id: "dal-makhani-naan", name: "Dal makhani + naan", region: "punjabi", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 3, contains: ["dairy","gluten","onion-garlic"], ingredients: ["urad dal","rajma","cream","butter"] },
  { id: "dal-tadka-rice", name: "Dal tadka + jeera rice", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["onion-garlic"], ingredients: ["toor dal","rice","onion"] },
  { id: "paneer-butter-masala", name: "Paneer butter masala", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 3, contains: ["dairy","onion-garlic"], ingredients: ["paneer","tomato","cream","onion"] },
  { id: "palak-paneer", name: "Palak paneer + roti", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["dairy","onion-garlic"], ingredients: ["spinach","paneer","onion"] },
  { id: "kadai-paneer", name: "Kadai paneer", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["dairy","onion-garlic"], ingredients: ["paneer","capsicum","onion","tomato"] },
  { id: "shahi-paneer", name: "Shahi paneer", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 3, contains: ["dairy","nuts","onion-garlic"], ingredients: ["paneer","cashew","cream"] },
  { id: "malai-kofta", name: "Malai kofta", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 3, contains: ["dairy","nuts","onion-garlic"], ingredients: ["paneer","cashew","cream","potato"] },
  { id: "mutter-paneer", name: "Mutter paneer", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["dairy","onion-garlic"], ingredients: ["paneer","peas","tomato"] },
  { id: "aloo-gobi", name: "Aloo gobi + roti", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["root","gluten"], ingredients: ["potato","cauliflower"] },
  { id: "baingan-bharta", name: "Baingan bharta + roti", region: "punjabi", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["brinjal","onion"] },
  { id: "bhindi-masala", name: "Bhindi masala + roti", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["okra","onion"] },
  { id: "kadhi-chawal", name: "Kadhi chawal", region: "punjabi", diet: "veg", jain: false, meals: ["lunch"], spice: 1, effort: 2, heaviness: 2, contains: ["dairy","onion-garlic"], ingredients: ["yogurt","gram flour","rice"] },
  { id: "veg-pulao", name: "Veg pulao + raita", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["dairy","root"], ingredients: ["rice","peas","carrot","yogurt"] },
  { id: "khichdi", name: "Khichdi + papad", region: "everyday", diet: "veg", jain: true, meals: ["dinner"], spice: 1, effort: 1, heaviness: 1, contains: [], ingredients: ["rice","moong dal","ghee"] },
  { id: "dum-aloo", name: "Dum aloo + poori", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 3, contains: ["dairy","gluten","root","onion-garlic"], ingredients: ["potato","yogurt","onion"] },

  // North Indian non-veg
  { id: "butter-chicken-naan", name: "Butter chicken + naan", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 3, contains: ["dairy","gluten","onion-garlic"], ingredients: ["chicken","butter","cream","tomato"] },
  { id: "chicken-curry-rice", name: "Chicken curry + rice", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["chicken","onion","tomato","rice"] },
  { id: "chicken-biryani", name: "Chicken biryani", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 3, contains: ["dairy","onion-garlic"], ingredients: ["chicken","rice","yogurt","onion"] },
  { id: "mutton-biryani", name: "Mutton biryani", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 3, contains: ["dairy","onion-garlic"], ingredients: ["mutton","rice","yogurt","onion"] },
  { id: "rogan-josh", name: "Mutton rogan josh + rice", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 3, contains: ["dairy","onion-garlic"], ingredients: ["mutton","yogurt","onion"] },
  { id: "keema-matar", name: "Keema matar + roti", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["mutton mince","peas","onion"] },
  { id: "tandoori-chicken", name: "Tandoori chicken + naan", region: "north", diet: "non-veg", jain: false, meals: ["dinner"], spice: 2, effort: 3, heaviness: 2, contains: ["dairy","gluten","onion-garlic"], ingredients: ["chicken","yogurt","spices"] },
  { id: "chicken-tikka-masala", name: "Chicken tikka masala", region: "north", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 3, contains: ["dairy","onion-garlic"], ingredients: ["chicken","cream","tomato","onion"] },

  // Eggs
  { id: "anda-curry-roti", name: "Anda curry + roti", region: "everyday", diet: "egg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["eggs","onion","tomato"] },
  { id: "egg-bhurji-paratha", name: "Egg bhurji + paratha", region: "everyday", diet: "egg", jain: false, meals: ["breakfast","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["eggs","onion"] },
  { id: "masala-omelette", name: "Masala omelette + toast", region: "everyday", diet: "egg", jain: false, meals: ["breakfast"], spice: 2, effort: 1, heaviness: 1, contains: ["gluten","onion-garlic"], ingredients: ["eggs","onion","chilli"] },

  // South Indian
  { id: "idli-sambar", name: "Idli sambar", region: "south", diet: "veg", jain: true, meals: ["breakfast"], spice: 2, effort: 2, heaviness: 1, contains: [], ingredients: ["rice","urad dal","toor dal"] },
  { id: "plain-dosa", name: "Plain dosa with chutney", region: "south", diet: "veg", jain: true, meals: ["breakfast","dinner"], spice: 1, effort: 2, heaviness: 2, contains: [], ingredients: ["rice","urad dal","coconut"] },
  { id: "masala-dosa", name: "Masala dosa", region: "south", diet: "veg", jain: false, meals: ["breakfast","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["root","onion-garlic"], ingredients: ["rice","potato","onion"] },
  { id: "rava-dosa", name: "Rava dosa", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["semolina","onion"] },
  { id: "mysore-masala-dosa", name: "Mysore masala dosa", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 3, effort: 2, heaviness: 2, contains: ["root","onion-garlic"], ingredients: ["rice","potato","onion","red chilli"] },
  { id: "uttapam", name: "Uttapam + chutney", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["rice","onion","tomato"] },
  { id: "medu-vada", name: "Medu vada with sambar", region: "south", diet: "veg", jain: true, meals: ["breakfast","snack"], spice: 2, effort: 2, heaviness: 2, contains: [], ingredients: ["urad dal"] },
  { id: "pongal", name: "Ven pongal", region: "south", diet: "veg", jain: true, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 2, contains: ["dairy"], ingredients: ["rice","moong dal","ghee","pepper"] },
  { id: "lemon-rice", name: "Lemon rice", region: "south", diet: "veg", jain: true, meals: ["lunch"], spice: 2, effort: 1, heaviness: 2, contains: ["nuts"], ingredients: ["rice","lemon","peanuts"] },
  { id: "curd-rice", name: "Curd rice + pickle", region: "south", diet: "veg", jain: true, meals: ["lunch","dinner"], spice: 1, effort: 1, heaviness: 1, contains: ["dairy"], ingredients: ["rice","yogurt"] },
  { id: "sambar-rice", name: "Sambar rice", region: "south", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["root","onion-garlic"], ingredients: ["rice","toor dal","tamarind","drumstick"] },
  { id: "rasam-rice", name: "Rasam rice", region: "south", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 1, contains: ["onion-garlic"], ingredients: ["tamarind","tomato","rice"] },
  { id: "bisi-bele-bath", name: "Bisi bele bath", region: "south", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["root","onion-garlic"], ingredients: ["rice","toor dal","vegetables"] },
  { id: "tomato-rice", name: "Tomato rice", region: "south", diet: "veg", jain: false, meals: ["lunch"], spice: 2, effort: 1, heaviness: 2, contains: ["onion-garlic"], ingredients: ["rice","tomato","onion"] },
  { id: "coconut-rice", name: "Coconut rice", region: "south", diet: "veg", jain: true, meals: ["lunch"], spice: 1, effort: 1, heaviness: 2, contains: [], ingredients: ["rice","coconut"] },
  { id: "puliyodarai", name: "Tamarind rice (puliyodarai)", region: "south", diet: "veg", jain: true, meals: ["lunch"], spice: 2, effort: 2, heaviness: 2, contains: ["nuts"], ingredients: ["rice","tamarind","peanuts"] },
  { id: "avial-rice", name: "Avial + rice", region: "kerala", diet: "veg", jain: false, meals: ["lunch"], spice: 1, effort: 2, heaviness: 2, contains: ["dairy","root"], ingredients: ["mixed vegetables","coconut","yogurt"] },
  { id: "appam-stew", name: "Appam with veg stew", region: "kerala", diet: "veg", jain: false, meals: ["breakfast","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["root"], ingredients: ["rice","coconut milk","vegetables"] },
  { id: "kerala-parotta-chicken", name: "Kerala parotta + chicken curry", region: "kerala", diet: "non-veg", jain: false, meals: ["dinner"], spice: 2, effort: 3, heaviness: 3, contains: ["gluten","onion-garlic"], ingredients: ["chicken","flour","coconut"] },
  { id: "fish-moilee", name: "Fish moilee + appam", region: "kerala", diet: "non-veg", jain: false, meals: ["dinner"], spice: 2, effort: 3, heaviness: 2, contains: [], ingredients: ["fish","coconut milk"] },
  { id: "chettinad-chicken", name: "Chettinad chicken + rice", region: "south", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 2, contains: ["onion-garlic"], ingredients: ["chicken","black pepper","coconut"] },

  // Bengali
  { id: "machher-jhol", name: "Machher jhol + rice", region: "bengali", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["root"], ingredients: ["fish","potato","mustard"] },
  { id: "shorshe-ilish", name: "Shorshe ilish + rice", region: "bengali", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 2, contains: [], ingredients: ["hilsa","mustard"] },
  { id: "kosha-mangsho", name: "Kosha mangsho + luchi", region: "bengali", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 3, contains: ["gluten","onion-garlic"], ingredients: ["mutton","onion","yogurt"] },
  { id: "aloo-posto", name: "Aloo posto + rice", region: "bengali", diet: "veg", jain: false, meals: ["lunch"], spice: 1, effort: 1, heaviness: 2, contains: ["root"], ingredients: ["potato","poppy seeds"] },
  { id: "luchi-alur-dom", name: "Luchi alur dom", region: "bengali", diet: "veg", jain: false, meals: ["breakfast","lunch"], spice: 2, effort: 2, heaviness: 3, contains: ["gluten","root","onion-garlic"], ingredients: ["flour","potato"] },

  // Gujarati
  { id: "thepla-chai", name: "Methi thepla with chai", region: "gujarati", diet: "veg", jain: false, meals: ["breakfast","snack"], spice: 1, effort: 2, heaviness: 1, contains: ["gluten","dairy"], ingredients: ["wheat","fenugreek","yogurt"] },
  { id: "khaman-dhokla", name: "Khaman dhokla", region: "gujarati", diet: "veg", jain: true, meals: ["breakfast","snack"], spice: 1, effort: 2, heaviness: 1, contains: [], ingredients: ["gram flour"] },
  { id: "khandvi", name: "Khandvi", region: "gujarati", diet: "veg", jain: true, meals: ["snack"], spice: 1, effort: 3, heaviness: 1, contains: ["dairy"], ingredients: ["gram flour","yogurt"] },
  { id: "undhiyu-puri", name: "Undhiyu + puri", region: "gujarati", diet: "veg", jain: false, meals: ["lunch"], spice: 2, effort: 3, heaviness: 3, contains: ["gluten","root"], ingredients: ["mixed vegetables","flour"] },
  { id: "guju-thali", name: "Gujarati thali (dal-bhaat-shaak-rotli)", region: "gujarati", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 3, heaviness: 3, contains: ["gluten","dairy"], ingredients: ["dal","rice","vegetables","wheat"] },

  // Maharashtrian
  { id: "pav-bhaji", name: "Pav bhaji", region: "maharashtrian", diet: "veg", jain: false, meals: ["dinner","snack"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","dairy","root","onion-garlic"], ingredients: ["mixed vegetables","butter","pav","potato"] },
  { id: "vada-pav", name: "Vada pav", region: "maharashtrian", diet: "veg", jain: false, meals: ["snack"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","root","onion-garlic"], ingredients: ["potato","gram flour","pav"] },
  { id: "misal-pav", name: "Misal pav", region: "maharashtrian", diet: "veg", jain: false, meals: ["breakfast","snack"], spice: 3, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["sprouts","onion","pav"] },
  { id: "sabudana-khichdi", name: "Sabudana khichdi", region: "maharashtrian", diet: "veg", jain: true, meals: ["breakfast","snack"], spice: 1, effort: 1, heaviness: 2, contains: ["nuts"], ingredients: ["sago","peanuts"] },
  { id: "poha", name: "Poha", region: "maharashtrian", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: ["nuts","onion-garlic"], ingredients: ["flattened rice","onion","peanuts"] },
  { id: "puran-poli", name: "Puran poli", region: "maharashtrian", diet: "veg", jain: true, meals: ["lunch","snack"], spice: 1, effort: 3, heaviness: 2, contains: ["gluten"], ingredients: ["chana dal","jaggery","wheat"] },

  // Parathas
  { id: "aloo-paratha", name: "Aloo paratha + curd", region: "punjabi", diet: "veg", jain: false, meals: ["breakfast"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","dairy","root"], ingredients: ["potato","wheat","yogurt"] },
  { id: "gobi-paratha", name: "Gobi paratha + curd", region: "punjabi", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 2, heaviness: 2, contains: ["gluten","dairy"], ingredients: ["cauliflower","wheat"] },
  { id: "paneer-paratha", name: "Paneer paratha + curd", region: "punjabi", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 2, heaviness: 2, contains: ["gluten","dairy"], ingredients: ["paneer","wheat"] },

  // Goan
  { id: "goan-fish-curry", name: "Goan fish curry + rice", region: "goan", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["fish","coconut","kokum"] },
  { id: "chicken-vindaloo", name: "Chicken vindaloo + rice", region: "goan", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 2, contains: ["onion-garlic"], ingredients: ["chicken","vinegar","red chilli"] },
  { id: "prawn-balchao", name: "Prawn balchao + rice", region: "goan", diet: "non-veg", jain: false, meals: ["lunch","dinner"], spice: 3, effort: 3, heaviness: 2, contains: ["onion-garlic"], ingredients: ["prawns","red chilli","vinegar"] },

  // Indo-Chinese
  { id: "veg-hakka-noodles", name: "Veg hakka noodles", region: "indo-chinese", diet: "veg", jain: false, meals: ["dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["noodles","cabbage","capsicum"] },
  { id: "veg-fried-rice", name: "Veg fried rice", region: "indo-chinese", diet: "veg", jain: false, meals: ["dinner"], spice: 1, effort: 1, heaviness: 2, contains: ["onion-garlic"], ingredients: ["rice","vegetables"] },
  { id: "chilli-paneer", name: "Chilli paneer + fried rice", region: "indo-chinese", diet: "veg", jain: false, meals: ["dinner"], spice: 3, effort: 2, heaviness: 2, contains: ["dairy","gluten","onion-garlic"], ingredients: ["paneer","capsicum","soy sauce"] },
  { id: "gobi-manchurian", name: "Gobi manchurian", region: "indo-chinese", diet: "veg", jain: false, meals: ["dinner","snack"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["cauliflower","cornflour","soy sauce"] },
  { id: "schezwan-noodles", name: "Schezwan noodles", region: "indo-chinese", diet: "veg", jain: false, meals: ["dinner"], spice: 3, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["noodles","schezwan sauce"] },
  { id: "chilli-chicken", name: "Chilli chicken + fried rice", region: "indo-chinese", diet: "non-veg", jain: false, meals: ["dinner"], spice: 3, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["chicken","capsicum","soy sauce"] },

  // Light / quick
  { id: "besan-chilla", name: "Besan chilla", region: "everyday", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: ["onion-garlic"], ingredients: ["gram flour","onion","tomato"] },
  { id: "upma", name: "Upma", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: ["root"], ingredients: ["semolina","vegetables"] },
  { id: "paneer-bhurji-roti", name: "Paneer bhurji + roti", region: "north", diet: "veg", jain: false, meals: ["dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["dairy","gluten","onion-garlic"], ingredients: ["paneer","onion","tomato"] },
  { id: "dalia", name: "Dalia (savoury)", region: "everyday", diet: "veg", jain: false, meals: ["breakfast","dinner"], spice: 1, effort: 1, heaviness: 1, contains: ["gluten","root"], ingredients: ["broken wheat","vegetables"] },
  { id: "veg-soup-bread", name: "Vegetable soup + garlic bread", region: "continental", diet: "veg", jain: false, meals: ["dinner"], spice: 1, effort: 1, heaviness: 1, contains: ["gluten","root","onion-garlic"], ingredients: ["mixed vegetables","bread"] },
  { id: "dal-roti-sabzi", name: "Dal + roti + sabzi", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten"], ingredients: ["dal","wheat","vegetables"] },

  // More veg — breakfasts
  { id: "moong-dal-chilla", name: "Moong dal chilla + chutney", region: "north", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: ["onion-garlic"], ingredients: ["moong dal","onion","coriander"] },
  { id: "oats-chilla", name: "Oats chilla", region: "everyday", diet: "veg", jain: true, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: [], ingredients: ["oats","tomato","coriander"] },
  { id: "idiyappam-stew", name: "Idiyappam + veg stew", region: "kerala", diet: "veg", jain: false, meals: ["breakfast","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["root"], ingredients: ["rice flour","coconut milk","vegetables"] },
  { id: "akki-rotti", name: "Akki rotti + chutney", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 2, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["rice flour","onion","coriander"] },
  { id: "paniyaram", name: "Kuzhi paniyaram", region: "south", diet: "veg", jain: false, meals: ["breakfast","snack"], spice: 1, effort: 2, heaviness: 1, contains: ["onion-garlic"], ingredients: ["rice","urad dal","onion"] },
  { id: "methi-paratha", name: "Methi paratha + curd", region: "punjabi", diet: "veg", jain: true, meals: ["breakfast"], spice: 1, effort: 2, heaviness: 2, contains: ["gluten","dairy"], ingredients: ["wheat","fenugreek","yogurt"] },
  { id: "sheera", name: "Sooji sheera", region: "everyday", diet: "veg", jain: true, meals: ["breakfast","snack"], spice: 1, effort: 1, heaviness: 2, contains: ["dairy","gluten","nuts"], ingredients: ["semolina","ghee","sugar","cashew"] },
  { id: "ragi-dosa", name: "Ragi dosa + chutney", region: "south", diet: "veg", jain: true, meals: ["breakfast","dinner"], spice: 1, effort: 2, heaviness: 1, contains: [], ingredients: ["ragi","rice"] },
  { id: "rava-upma-veg", name: "Rava upma with veggies", region: "south", diet: "veg", jain: false, meals: ["breakfast"], spice: 1, effort: 1, heaviness: 1, contains: ["root"], ingredients: ["semolina","carrot","peas"] },

  // More veg — light dinners and sabzis
  { id: "lauki-chana-dal", name: "Lauki chana dal + roti", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["bottle gourd","chana dal","onion"] },
  { id: "tinda-masala", name: "Tinda masala + roti", region: "punjabi", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","onion-garlic"], ingredients: ["tinda","onion","tomato"] },
  { id: "turai-sabzi", name: "Turai sabzi + roti", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 1, heaviness: 1, contains: ["gluten","onion-garlic"], ingredients: ["ridge gourd","onion","tomato"] },
  { id: "karela-fry", name: "Karela fry + dal-rice", region: "north", diet: "veg", jain: false, meals: ["lunch"], spice: 2, effort: 2, heaviness: 2, contains: ["onion-garlic"], ingredients: ["bitter gourd","onion","besan"] },
  { id: "aloo-baingan", name: "Aloo baingan + roti", region: "north", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten","root","onion-garlic"], ingredients: ["potato","brinjal","onion"] },
  { id: "veg-kurma-appam", name: "Mixed veg kurma + appam", region: "kerala", diet: "veg", jain: false, meals: ["dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["root","onion-garlic"], ingredients: ["mixed vegetables","coconut","onion"] },
  { id: "palak-dal", name: "Palak dal + rice", region: "everyday", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 1, heaviness: 2, contains: ["onion-garlic"], ingredients: ["spinach","toor dal","rice"] },
  { id: "methi-malai-mutter", name: "Methi malai mutter + roti", region: "north", diet: "veg", jain: false, meals: ["dinner"], spice: 1, effort: 2, heaviness: 3, contains: ["dairy","gluten","nuts","onion-garlic"], ingredients: ["fenugreek","peas","cream","cashew"] },
  { id: "capsicum-besan", name: "Capsicum besan sabzi + roti", region: "everyday", diet: "veg", jain: true, meals: ["lunch","dinner"], spice: 2, effort: 1, heaviness: 2, contains: ["gluten"], ingredients: ["capsicum","gram flour"] },

  // More veg — regional gaps
  { id: "dal-dhokli", name: "Dal dhokli", region: "gujarati", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["gluten"], ingredients: ["toor dal","wheat","jaggery"] },
  { id: "thalipeeth", name: "Thalipeeth + curd", region: "maharashtrian", diet: "veg", jain: false, meals: ["breakfast","dinner"], spice: 2, effort: 2, heaviness: 2, contains: ["dairy","gluten","onion-garlic"], ingredients: ["multi-grain flour","onion","yogurt"] },
  { id: "mor-kuzhambu", name: "Mor kuzhambu + rice", region: "south", diet: "veg", jain: false, meals: ["lunch"], spice: 1, effort: 2, heaviness: 1, contains: ["dairy","root"], ingredients: ["yogurt","ash gourd","coconut"] },
  { id: "enchor-kalia", name: "Enchor (jackfruit) kalia + rice", region: "bengali", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 3, heaviness: 2, contains: ["onion-garlic"], ingredients: ["raw jackfruit","onion","yogurt"] },
  { id: "pindi-chana", name: "Pindi chana + kulcha", region: "punjabi", diet: "veg", jain: false, meals: ["lunch","dinner"], spice: 2, effort: 2, heaviness: 3, contains: ["gluten","onion-garlic"], ingredients: ["chickpeas","onion","wheat"] },

  // More veg — jain-friendly fillers
  { id: "jain-pav-bhaji", name: "Jain pav bhaji (no onion/garlic)", region: "maharashtrian", diet: "veg", jain: true, meals: ["dinner","snack"], spice: 2, effort: 2, heaviness: 2, contains: ["gluten","dairy"], ingredients: ["raw banana","capsicum","butter","pav"] },
  { id: "jain-veg-pulao", name: "Jain veg pulao + raita", region: "everyday", diet: "veg", jain: true, meals: ["lunch","dinner"], spice: 1, effort: 2, heaviness: 2, contains: ["dairy"], ingredients: ["rice","peas","yogurt"] },
  { id: "jain-dal-khichdi", name: "Jain dal khichdi + papad", region: "gujarati", diet: "veg", jain: true, meals: ["dinner"], spice: 1, effort: 1, heaviness: 1, contains: [], ingredients: ["rice","moong dal","ghee"] },
];

export const ALL_REGIONS = [
  ["north","North Indian"], ["south","South Indian"], ["bengali","Bengali"],
  ["gujarati","Gujarati"], ["maharashtrian","Maharashtrian"], ["punjabi","Punjabi"],
  ["kerala","Kerala"], ["goan","Goan"], ["indo-chinese","Indo-Chinese"],
  ["continental","Continental"], ["everyday","Everyday"],
];

export const DEFAULT_FILTERS = {
  diet: "any",          // any | veg | egg | non-veg | jain
  excludedRegions: [],
  excludedIngredients: [],
  maxSpice: 3,
  maxEffort: 3,
};

export function dishesForFilters(filters) {
  return DISHES.filter((d) => {
    if (filters.diet === "veg" && d.diet !== "veg") return false;
    if (filters.diet === "egg" && d.diet === "non-veg") return false;
    if (filters.diet === "non-veg") { /* allow all */ }
    if (filters.diet === "jain" && !d.jain) return false;
    if ((filters.excludedRegions || []).includes(d.region)) return false;
    if (d.spice > (filters.maxSpice ?? 3)) return false;
    if (d.effort > (filters.maxEffort ?? 3)) return false;
    const excl = (filters.excludedIngredients || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
    if (excl.length) {
      const hay = (d.ingredients || []).map((s) => s.toLowerCase()).join(" ");
      if (excl.some((bad) => hay.includes(bad))) return false;
    }
    return true;
  });
}
