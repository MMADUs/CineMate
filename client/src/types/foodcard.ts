export interface FoodCardProps {
    id?: number;
    name: string;
    price: string;
    imgUrl: string;
    onAdd?: () => void;
}