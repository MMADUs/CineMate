export interface FnbItem {
    id: string;
    name: string;
    category: 'Snack' | 'Drink' | 'Combo';
    price: number;
    stock: number;
    imgUrl: string;
}

export interface FoodCardProps {
    id?: number;
    name: string;
    price: string;
    imgUrl: string;
    onAdd?: () => void;
}