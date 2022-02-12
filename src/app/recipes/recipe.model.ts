import { Ingredient } from "../shared/Ingredient.model";

/**
 * Modèle définissant une recette
 */
export class Recipe {
    public name: string;
    public description: string;
    public imageURL: string;
    public ingredients: Ingredient[];

    /**
     * 
     * @param name nom de la recette
     * @param description description détaillé de la recette
     * @param imageURL image d'illustration
     * @param ingredients liste d'ingrédients de la recette
     */
    constructor(name: string, description: string, imageURL: string, ingredients: Ingredient[]){
        this.name = name;
        this.description = description;
        this.imageURL = imageURL;
        this.ingredients = ingredients;
    }
}
