import type { Allergen, Ingredient, MealSlot, Recipe } from '@/domain/types'

// Editorial catalogue v1. Quantities are culinary yields, not individual nutrition targets.
// Cooked legumes/grains are explicitly named; their advance preparation is not hidden in the timer.
type Food = {name: string; category: string; allergens: Allergen[]}
const food = (name: string, category: string, allergens: Allergen[] = []): Food => ({name, category, allergens})
export const foods = {
  banana: food('Banana','Frutas'), apple: food('Maçã','Frutas'), papaya: food('Mamão','Frutas'),
  pear: food('Pera','Frutas'), mango: food('Manga','Frutas'), orange: food('Laranja','Frutas'),
  strawberry: food('Morango','Frutas'), avocado: food('Abacate','Frutas'), lemon: food('Limão','Frutas'),
  tomato: food('Tomate','Vegetais'), carrot: food('Cenoura','Vegetais'), zucchini: food('Abobrinha','Vegetais'),
  broccoli: food('Brócolis','Vegetais'), cucumber: food('Pepino','Vegetais'), greens: food('Folhas verdes','Vegetais'),
  cabbage: food('Repolho','Vegetais'), pumpkin: food('Abóbora','Vegetais'), potato: food('Batata','Vegetais'),
  sweetpotato: food('Batata-doce','Vegetais'), onion: food('Cebola','Vegetais'), garlic: food('Alho','Vegetais'),
  mushroom: food('Cogumelo','Vegetais'), spinach: food('Espinafre','Vegetais'), beet: food('Beterraba cozida','Vegetais'),
  rice: food('Arroz cozido','Grãos e cereais'), brownrice: food('Arroz integral cozido','Grãos e cereais'),
  oats: food('Aveia','Grãos e cereais',['gluten']), corn: food('Flocão de milho','Grãos e cereais'),
  cornCooked: food('Milho cozido','Grãos e cereais'), quinoa: food('Quinoa cozida','Grãos e cereais'),
  tapioca: food('Goma de tapioca hidratada','Grãos e cereais'), bread: food('Pão integral','Pães',['gluten']),
  pasta: food('Macarrão de trigo','Grãos e cereais',['gluten']),
  beans: food('Feijão cozido','Leguminosas'), chickpeas: food('Grão-de-bico cozido','Leguminosas'),
  lentils: food('Lentilha cozida','Leguminosas'), peas: food('Ervilha cozida','Leguminosas'),
  tofu: food('Tofu','Proteínas',['soja']), egg: food('Ovo','Proteínas',['ovos']),
  chicken: food('Frango cozido desfiado','Proteínas'), sardine: food('Sardinha em conserva','Proteínas',['peixe']),
  tuna: food('Atum em conserva','Proteínas',['peixe']), fish: food('Filé de peixe','Proteínas',['peixe']),
  yogurt: food('Iogurte natural','Laticínios',['leite']), milk: food('Leite','Laticínios',['leite']),
  cheese: food('Queijo branco','Laticínios',['leite']), ricotta: food('Ricota','Laticínios',['leite']),
  peanuts: food('Amendoim sem sal','Oleaginosas',['amendoim']), nuts: food('Castanha-de-caju','Oleaginosas',['castanhas']),
  sesame: food('Gergelim','Sementes',['gergelim']), chia: food('Chia','Sementes'),
  sunflower: food('Semente de girassol','Sementes'), oil: food('Azeite','Temperos'),
  cinnamon: food('Canela','Temperos'), parsley: food('Salsinha','Temperos'), water: food('Água','Despensa'),
} satisfies Record<string, Food>
export type FoodKey = keyof typeof foods
type Part = [FoodKey, number, Ingredient['unit']]
function recipe(id: string, name: string, slots: MealSlot[], minutes: number, diet: Recipe['diet'], parts: Part[], steps: string[], economical = true): Recipe {
  return {id, name, slots, minutes, servings: 1, diet, economical,
    ingredients: parts.map(([key, quantity, unit]) => ({name: foods[key].name, category: foods[key].category, quantity, unit})),
    allergens: [...new Set(parts.flatMap(([key]) => foods[key].allergens))], steps,
    tags: [minutes <= 15 ? 'Rápida' : 'Para cozinhar', economical ? 'Econômica' : 'Mais variedade', diet === 'vegana' ? 'Vegetal' : diet === 'vegetariana' ? 'Vegetariana' : 'Variada'],
  }
}
const breakfast: MealSlot[] = ['breakfast','snack']
const main: MealSlot[] = ['lunch','dinner']
const snack: MealSlot[] = ['snack','breakfast']
export const recipes: Recipe[] = [
  recipe('banana-aveia','Banana com aveia e canela',breakfast,5,'vegana',[['banana',1,'un'],['oats',30,'g'],['cinnamon',1,'g']],['Descasque e corte a banana.','Misture com a aveia e finalize com canela.']),
  recipe('tapioca-tomate','Tapioca de tomate',breakfast,10,'vegana',[['tapioca',60,'g'],['tomato',1,'un'],['oil',5,'ml']],['Lave e pique o tomate.','Espalhe a goma em frigideira antiaderente aquecida. Quando unir, vire.','Recheie com o tomate, acrescente o azeite e dobre.']),
  recipe('cuscuz-banana','Cuscuz com banana',breakfast,15,'vegana',[['corn',50,'g'],['water',40,'ml'],['banana',1,'un']],['Umedeça o flocão com a água e espere 5 minutos.','Cozinhe em cuscuzeira no vapor por cerca de 8 minutos, até ficar macio.','Sirva com a banana fatiada.']),
  recipe('batata-doce-fruta','Batata-doce com mamão',breakfast,20,'vegana',[['sweetpotato',150,'g'],['papaya',120,'g'],['cinnamon',1,'g']],['Lave a batata, corte em cubos e cozinhe em água até ficar macia; escorra.','Corte o mamão e sirva ao lado. Finalize a batata com canela.']),
  recipe('iogurte-mamao','Iogurte com mamão',breakfast,5,'vegetariana',[['yogurt',170,'g'],['papaya',120,'g'],['chia',10,'g']],['Corte o mamão em cubos.','Misture com o iogurte e distribua a chia.']),
  recipe('mingau-maca','Mingau de maçã',breakfast,12,'vegetariana',[['oats',35,'g'],['milk',180,'ml'],['apple',1,'un'],['cinnamon',1,'g']],['Lave e rale a maçã.','Leve leite, aveia e maçã ao fogo baixo e mexa por 6 a 8 minutos até engrossar.','Desligue e acrescente a canela.']),
  recipe('pao-ovo','Pão com ovo e tomate',breakfast,12,'vegetariana',[['bread',2,'un'],['egg',1,'un'],['tomato',1,'un'],['oil',5,'ml']],['Lave e fatie o tomate.','Aqueça o azeite e prepare o ovo até clara e gema ficarem firmes.','Monte o pão com o ovo e o tomate.']),
  recipe('tapioca-queijo','Tapioca de queijo branco',breakfast,10,'vegetariana',[['tapioca',60,'g'],['cheese',40,'g'],['tomato',0.5,'un']],['Espalhe a goma em frigideira aquecida e vire quando unir.','Adicione queijo e tomate lavado e fatiado. Dobre e aqueça por mais 1 minuto.']),
  recipe('pao-abacate','Pão com abacate e limão',breakfast,8,'vegana',[['bread',2,'un'],['avocado',80,'g'],['lemon',0.5,'un']],['Retire a polpa do abacate e amasse com o limão.','Toste o pão se desejar e espalhe a pasta.']),
  recipe('cuscuz-ovo','Cuscuz com ovo',breakfast,18,'vegetariana',[['corn',50,'g'],['water',40,'ml'],['egg',1,'un'],['oil',5,'ml']],['Umedeça o flocão e deixe hidratar por 5 minutos. Cozinhe no vapor por cerca de 8 minutos.','Mexa o ovo em frigideira com azeite até ficar completamente firme. Sirva junto.']),
  recipe('tofu-mexido','Tofu mexido com tomate',breakfast,12,'vegana',[['tofu',120,'g'],['tomato',1,'un'],['oil',5,'ml'],['parsley',5,'g']],['Lave e pique o tomate e a salsinha.','Amasse o tofu. Aqueça o azeite, junte o tomate e refogue por 3 minutos.','Adicione tofu e salsinha e aqueça por mais 5 minutos.']),
  recipe('creme-manga','Creme de manga e banana',breakfast,5,'vegana',[['mango',120,'g'],['banana',1,'un'],['water',30,'ml']],['Descasque as frutas e corte a polpa.','Bata com água no liquidificador até ficar cremoso. Sirva em uma tigela.']),
  recipe('panqueca-banana','Panqueca de banana e aveia',breakfast,15,'vegetariana',[['banana',1,'un'],['egg',1,'un'],['oats',25,'g'],['oil',5,'ml']],['Amasse a banana e misture com ovo e aveia.','Unte a frigideira e faça pequenas panquecas em fogo baixo.','Vire e cozinhe até os dois lados e o centro estarem firmes.']),
  recipe('arroz-maca','Arroz cremoso com maçã',breakfast,10,'vegana',[['rice',100,'g'],['apple',1,'un'],['water',80,'ml'],['cinnamon',1,'g']],['Lave e rale a maçã.','Aqueça arroz já cozido, maçã e água por 5 minutos, mexendo.','Amasse levemente e acrescente canela.']),
  recipe('ricota-pera','Torrada de ricota e pera',breakfast,8,'vegetariana',[['bread',2,'un'],['ricotta',50,'g'],['pear',1,'un']],['Lave e fatie a pera.','Toste o pão, espalhe a ricota e cubra com as fatias.']),
  recipe('frutas-girassol','Frutas com sementes de girassol',breakfast,5,'vegana',[['papaya',100,'g'],['banana',1,'un'],['sunflower',15,'g']],['Corte as frutas em uma tigela.','Distribua as sementes e sirva.']),

  recipe('arroz-feijao','Arroz, feijão e cenoura',main,15,'vegana',[['rice',120,'g'],['beans',100,'g'],['carrot',80,'g'],['oil',5,'ml']],['Lave e rale a cenoura. Refogue no azeite por 5 minutos.','Aqueça separadamente arroz e feijão já cozidos até ficarem bem quentes.','Sirva os três componentes juntos.']),
  recipe('lentilha-abobora','Lentilha com abóbora',main,25,'vegana',[['lentils',150,'g'],['pumpkin',150,'g'],['onion',0.5,'un'],['oil',5,'ml'],['water',100,'ml']],['Descasque e corte a abóbora em cubos pequenos.','Refogue a cebola no azeite, acrescente abóbora e água e cozinhe tampado até amaciar.','Junte a lentilha já cozida e aqueça por mais 5 minutos.']),
  recipe('grao-bico-salada','Salada de grão-de-bico',main,10,'vegana',[['chickpeas',150,'g'],['cucumber',100,'g'],['tomato',1,'un'],['lemon',0.5,'un'],['oil',5,'ml']],['Lave o pepino e o tomate e corte em cubos.','Escorra o grão-de-bico já cozido.','Misture tudo e tempere com limão e azeite.']),
  recipe('arroz-brocolis','Arroz com brócolis e feijão',main,15,'vegana',[['rice',120,'g'],['broccoli',100,'g'],['beans',100,'g'],['oil',5,'ml']],['Lave o brócolis e cozinhe no vapor até ficar macio.','Aqueça o arroz já cozido com azeite e misture o brócolis.','Aqueça bem o feijão já cozido e sirva ao lado.']),
  recipe('cuscuz-ervilha','Cuscuz com ervilha e cenoura',main,20,'vegana',[['corn',60,'g'],['water',50,'ml'],['peas',100,'g'],['carrot',80,'g'],['oil',5,'ml']],['Hidrate o flocão com água por 5 minutos e cozinhe no vapor até ficar macio.','Lave e rale a cenoura; refogue no azeite.','Acrescente a ervilha já cozida, aqueça bem e misture ao cuscuz.']),
  recipe('quinoa-legumes','Quinoa com legumes e lentilha',main,20,'vegana',[['quinoa',120,'g'],['lentils',100,'g'],['zucchini',100,'g'],['carrot',60,'g'],['oil',5,'ml']],['Lave e corte os legumes em cubos pequenos.','Refogue no azeite até ficarem macios.','Junte quinoa e lentilha já cozidas e aqueça bem.'],false),
  recipe('sopa-feijao','Sopa de feijão e abóbora',main,25,'vegana',[['beans',150,'g'],['pumpkin',150,'g'],['water',250,'ml'],['garlic',1,'un'],['oil',5,'ml']],['Descasque a abóbora e corte em cubos.','Refogue o alho no azeite, junte abóbora e água e cozinhe até amaciar.','Adicione o feijão já cozido, aqueça e amasse parte da sopa para engrossar.']),
  recipe('batata-grao','Batata com grão-de-bico',main,25,'vegana',[['potato',180,'g'],['chickpeas',120,'g'],['tomato',1,'un'],['oil',5,'ml']],['Lave e corte a batata; cozinhe em água até ficar macia e escorra.','Refogue o tomate lavado e picado no azeite.','Junte grão-de-bico já cozido e batata, misture e aqueça bem.']),
  recipe('repolho-lentilha','Repolho com lentilha e arroz',main,15,'vegana',[['cabbage',120,'g'],['lentils',100,'g'],['rice',100,'g'],['oil',5,'ml']],['Lave e fatie o repolho. Refogue no azeite até murchar.','Acrescente lentilha e arroz já cozidos e aqueça por completo.']),
  recipe('macarrao-tomate','Macarrão com tomate e grão-de-bico',main,20,'vegana',[['pasta',80,'g'],['tomato',2,'un'],['chickpeas',100,'g'],['garlic',1,'un'],['oil',5,'ml']],['Cozinhe o macarrão em água conforme a embalagem e escorra.','Refogue alho e tomate lavado e picado no azeite até formar um molho.','Acrescente grão-de-bico já cozido, aqueça e envolva o macarrão.']),
  recipe('tofu-arroz','Tofu dourado com arroz',main,20,'vegana',[['tofu',150,'g'],['brownrice',120,'g'],['zucchini',100,'g'],['oil',5,'ml']],['Corte o tofu e a abobrinha lavada em cubos.','Doure o tofu no azeite e acrescente a abobrinha até amaciar.','Sirva com arroz integral já cozido e bem aquecido.']),
  recipe('omelete-espinafre','Omelete de espinafre com arroz',main,15,'vegetariana',[['egg',2,'un'],['spinach',60,'g'],['rice',120,'g'],['oil',5,'ml']],['Lave e pique o espinafre. Bata os ovos e misture.','Aqueça o azeite e cozinhe a omelete dos dois lados até o centro ficar firme.','Sirva com arroz já cozido e bem aquecido.']),
  recipe('frango-abobora','Frango com abóbora e arroz',main,25,'variada',[['chicken',120,'g'],['pumpkin',150,'g'],['rice',120,'g'],['oil',5,'ml'],['water',80,'ml']],['Descasque e corte a abóbora. Refogue no azeite e junte a água.','Cozinhe tampado até amaciar. Junte o frango já cozido e aqueça completamente.','Sirva com arroz já cozido e bem aquecido.']),
  recipe('frango-cenoura','Arroz com frango e cenoura',main,15,'variada',[['chicken',120,'g'],['rice',120,'g'],['carrot',80,'g'],['oil',5,'ml']],['Lave e rale a cenoura. Refogue no azeite por 5 minutos.','Adicione frango e arroz já cozidos. Misture e aqueça completamente.']),
  recipe('sardinha-batata','Sardinha com batata e tomate',main,25,'variada',[['sardine',100,'g'],['potato',180,'g'],['tomato',1,'un'],['lemon',0.5,'un']],['Lave e corte a batata, cozinhe em água até amaciar e escorra.','Escorra a sardinha e confira se há espinhas.','Sirva com batata e tomate lavado, finalizando com limão.']),
  recipe('atum-feijao','Salada de feijão com atum',main,10,'variada',[['tuna',100,'g'],['beans',120,'g'],['cucumber',80,'g'],['tomato',1,'un'],['oil',5,'ml']],['Escorra o atum e o feijão já cozido.','Lave e pique pepino e tomate. Misture aos demais ingredientes e acrescente azeite.'],false),
  recipe('peixe-legumes','Peixe com brócolis e batata',main,30,'variada',[['fish',150,'g'],['broccoli',100,'g'],['potato',150,'g'],['oil',5,'ml'],['lemon',0.5,'un']],['Lave os vegetais. Corte a batata e cozinhe em água até amaciar; adicione brócolis nos minutos finais.','Aqueça o azeite e cozinhe o peixe dos dois lados até atingir 63 °C no centro; retire espinhas.','Sirva com os legumes escorridos e limão.'],false),
  recipe('salada-queijo','Salada de feijão, milho e queijo',main,10,'vegetariana',[['beans',120,'g'],['cornCooked',80,'g'],['cheese',50,'g'],['tomato',1,'un'],['oil',5,'ml']],['Escorra feijão e milho já cozidos.','Lave o tomate e corte em cubos, junto com o queijo.','Misture tudo com azeite.']),
  recipe('grao-espinafre','Grão-de-bico com espinafre',main,15,'vegana',[['chickpeas',160,'g'],['spinach',80,'g'],['tomato',1,'un'],['oil',5,'ml']],['Lave e pique espinafre e tomate.','Refogue o tomate no azeite, junte o espinafre até murchar.','Adicione grão-de-bico já cozido e aqueça bem.']),
  recipe('lentilha-beterraba','Lentilha com beterraba e arroz',main,10,'vegana',[['lentils',120,'g'],['beet',100,'g'],['brownrice',100,'g'],['oil',5,'ml']],['Corte a beterraba já cozida em cubos.','Aqueça arroz e lentilha já cozidos com azeite. Misture a beterraba e sirva.']),
  recipe('sopa-ervilha','Sopa de ervilha e cenoura',main,20,'vegana',[['peas',150,'g'],['carrot',100,'g'],['water',200,'ml'],['onion',0.5,'un'],['oil',5,'ml']],['Lave e corte a cenoura em pedaços pequenos.','Refogue cebola no azeite, acrescente cenoura e água e cozinhe até amaciar.','Junte ervilha já cozida, aqueça bem e amasse parte da sopa.']),
  recipe('abobrinha-feijao','Abobrinha com feijão e milho',main,15,'vegana',[['zucchini',150,'g'],['beans',120,'g'],['cornCooked',80,'g'],['oil',5,'ml']],['Lave e corte a abobrinha em cubos. Refogue no azeite até amaciar.','Adicione feijão e milho já cozidos e aqueça por completo.']),
  recipe('cogumelo-quinoa','Quinoa com cogumelos e ervilha',main,20,'vegana',[['quinoa',120,'g'],['mushroom',100,'g'],['peas',100,'g'],['oil',5,'ml']],['Limpe e fatie os cogumelos. Refogue no azeite até ficarem macios.','Junte quinoa e ervilha já cozidas e aqueça completamente.'],false),
  recipe('frango-cuscuz','Cuscuz com frango e tomate',main,20,'variada',[['corn',60,'g'],['water',50,'ml'],['chicken',120,'g'],['tomato',1,'un'],['oil',5,'ml']],['Hidrate o flocão por 5 minutos e cozinhe no vapor até ficar macio.','Refogue o tomate lavado e picado no azeite, acrescente o frango já cozido e aqueça por completo.','Misture ao cuscuz e sirva.']),

  recipe('maca-amendoim','Maçã com amendoim',snack,5,'vegana',[['apple',1,'un'],['peanuts',20,'g']],['Lave e corte a maçã.','Sirva com o amendoim sem sal.']),
  recipe('pera-castanha','Pera com castanha-de-caju',snack,5,'vegana',[['pear',1,'un'],['nuts',20,'g']],['Lave e corte a pera.','Separe as castanhas e sirva junto.'],false),
  recipe('mamao-laranja','Mamão com laranja',snack,5,'vegana',[['papaya',120,'g'],['orange',1,'un']],['Retire cascas e sementes.','Corte as frutas e misture em uma tigela.']),
  recipe('banana-chia','Banana com chia',snack,5,'vegana',[['banana',1,'un'],['chia',10,'g']],['Descasque e amasse a banana.','Misture a chia e sirva.']),
  recipe('cenoura-pasta','Cenoura com pasta de grão-de-bico',snack,10,'vegana',[['carrot',100,'g'],['chickpeas',80,'g'],['lemon',0.5,'un'],['oil',5,'ml'],['water',20,'ml']],['Lave e corte a cenoura em palitos.','Amasse ou bata grão-de-bico já cozido com água, azeite e limão.','Sirva a pasta com os palitos.']),
  recipe('iogurte-morango','Iogurte com morango',snack,5,'vegetariana',[['yogurt',170,'g'],['strawberry',100,'g']],['Lave os morangos, retire as folhas e corte.','Misture ao iogurte.'],false),
  recipe('abacate-limao','Abacate com limão e girassol',snack,5,'vegana',[['avocado',100,'g'],['lemon',0.5,'un'],['sunflower',10,'g']],['Amasse a polpa de abacate com limão.','Acrescente as sementes de girassol.']),
  recipe('manga-coco-livre','Manga com sementes',snack,5,'vegana',[['mango',150,'g'],['sunflower',15,'g']],['Descasque a manga e corte a polpa.','Sirva com as sementes de girassol.']),
  recipe('torrada-feijao','Torrada com pasta de feijão',snack,10,'vegana',[['bread',2,'un'],['beans',80,'g'],['oil',5,'ml'],['lemon',0.5,'un']],['Amasse o feijão já cozido e escorrido com limão e azeite.','Toste o pão e espalhe a pasta.']),
  recipe('milho-limao','Milho com limão',snack,8,'vegana',[['cornCooked',150,'g'],['lemon',0.5,'un'],['oil',5,'ml']],['Aqueça bem o milho já cozido.','Tempere com azeite e limão.']),
  recipe('tomate-queijo','Tomate com queijo branco',snack,5,'vegetariana',[['tomato',1,'un'],['cheese',50,'g'],['oil',5,'ml']],['Lave o tomate e corte em fatias.','Alterne com fatias de queijo e finalize com azeite.']),
  recipe('ovo-fruta','Ovo cozido com fruta',snack,15,'vegetariana',[['egg',1,'un'],['apple',1,'un']],['Cubra o ovo com água e cozinhe até clara e gema ficarem firmes, cerca de 10 minutos após ferver.','Resfrie para descascar. Lave e corte a maçã; sirva ao lado.']),
  recipe('pera-canela','Pera morna com canela',snack,10,'vegana',[['pear',1,'un'],['water',30,'ml'],['cinnamon',1,'g']],['Lave e corte a pera em cubos.','Aqueça com água em panela tampada por 5 a 7 minutos até amaciar.','Polvilhe a canela.']),
  recipe('maca-girassol','Maçã com sementes de girassol',snack,5,'vegana',[['apple',1,'un'],['sunflower',15,'g']],['Lave e corte a maçã.','Sirva com as sementes de girassol.']),
  recipe('pepino-grao','Pepino com grão-de-bico e gergelim',snack,10,'vegana',[['cucumber',100,'g'],['chickpeas',80,'g'],['sesame',5,'g'],['lemon',0.5,'un']],['Lave e corte o pepino em cubos.','Junte grão-de-bico já cozido, gergelim e limão.']),
  recipe('laranja-banana','Laranja e banana com canela',snack,5,'vegana',[['orange',1,'un'],['banana',1,'un'],['cinnamon',1,'g']],['Descasque as frutas e retire as sementes da laranja.','Corte e misture com canela.']),

  recipe('tigela-feijao','Tigela prática de feijão e tomate',main,10,'vegana',[['beans',150,'g'],['rice',100,'g'],['tomato',1,'un'],['oil',5,'ml']],['Aqueça completamente o feijão e o arroz já cozidos.','Lave e pique o tomate. Sirva na tigela e finalize com azeite.']),
  recipe('salada-lentilha','Salada rápida de lentilha',main,10,'vegana',[['lentils',150,'g'],['carrot',60,'g'],['cucumber',80,'g'],['lemon',0.5,'un'],['oil',5,'ml']],['Lave os vegetais, rale a cenoura e pique o pepino.','Misture à lentilha já cozida e escorrida. Tempere com limão e azeite.']),
  recipe('grao-milho','Grão-de-bico com milho e tomate',main,10,'vegana',[['chickpeas',150,'g'],['cornCooked',80,'g'],['tomato',1,'un'],['oil',5,'ml']],['Escorra grão-de-bico e milho já cozidos.','Lave e corte o tomate e misture todos os ingredientes.']),
  recipe('arroz-ervilha','Arroz rápido com ervilha',main,10,'vegana',[['rice',150,'g'],['peas',120,'g'],['carrot',60,'g'],['oil',5,'ml']],['Lave e rale a cenoura. Refogue no azeite por 3 minutos.','Junte arroz e ervilha já cozidos, aqueça por completo e sirva.']),
  recipe('sanduiche-frango','Sanduíche de frango',main,10,'variada',[['bread',2,'un'],['chicken',100,'g'],['tomato',1,'un'],['greens',30,'g']],['Lave tomate e folhas; fatie o tomate.','Aqueça completamente o frango já cozido.','Monte o pão com frango, tomate e folhas.']),
  recipe('sanduiche-grao','Sanduíche de grão-de-bico',main,10,'vegana',[['bread',2,'un'],['chickpeas',120,'g'],['carrot',60,'g'],['lemon',0.5,'un']],['Amasse o grão-de-bico já cozido com limão.','Lave e rale a cenoura. Misture à pasta e recheie o pão.']),
  recipe('salada-beterraba','Salada de beterraba e feijão',main,10,'vegana',[['beans',150,'g'],['beet',100,'g'],['cornCooked',80,'g'],['oil',5,'ml']],['Corte a beterraba já cozida.','Misture com feijão e milho já cozidos e escorridos. Acrescente azeite.']),
  recipe('tapioca-grao','Tapioca com pasta de grão-de-bico',main,10,'vegana',[['tapioca',70,'g'],['chickpeas',100,'g'],['tomato',1,'un'],['lemon',0.5,'un']],['Amasse grão-de-bico já cozido com limão. Lave e pique o tomate.','Espalhe a goma em frigideira aquecida e vire quando unir.','Recheie com pasta e tomate e dobre.']),
]

export const allergenNames: Record<Allergen, string> = {gluten:'Trigo / glúten',leite:'Leite',ovos:'Ovos',soja:'Soja',amendoim:'Amendoim',castanhas:'Castanhas',peixe:'Peixe',crustaceos:'Crustáceos',gergelim:'Gergelim'}
export const recipeById = new Map(recipes.map(r => [r.id,r]))
