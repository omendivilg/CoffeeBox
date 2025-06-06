import CoffeeClientPage from "./CoffeeClientPage";

// Generar rutas estáticas
export async function generateStaticParams() {
  return [
    { id: "blue-bottle-sf" },
    { id: "stumptown-portland" },
    { id: "intelligentsia-chicago" },
    { id: "counter-culture-durham" },
    { id: "ritual-coffee-sf" },
    { id: "la-colombe-philadelphia" },
  ];
}

export default function CoffeePage() {
  return <CoffeeClientPage />;
}
