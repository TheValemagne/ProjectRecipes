/**
 * Modèle définissant un ingrédient
 */
export class Ingredient {
    public name: string;
    public quantity: number;
    public unit: string;

    /**
     * 
     * @param name nom de l'ingrédient
     * @param quantity quantité à utiliser
     * @param unit unité de l'ingrédient
     */
    constructor(name: string, quantity: number, unit: string){
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
    }
}
