import { Subject } from "rxjs";
import { Injectable } from "@angular/core";

import { Ingredient } from "../shared/Ingredient.model";

@Injectable({
    providedIn: "root"
})
export class ShoppingListService {
    ingredientsChanged = new Subject<Ingredient[]>();
    startedEditing = new Subject<number>();
    
    private ingredients: Ingredient[] = [];

    /**
     * Trie les ingrédients de la liste en fonction du nom et de l'unité.
     */
    private sort(): void {
        const units = [ '', 'g', 'kg', 'L', 'cL', 'ml'];
        
        this.ingredients.sort(
            (a, b) => a.name.localeCompare(b.name) || units.indexOf(a.unit) - units.indexOf(b.unit)
        )
    }

    /**
     * Retourne une copie de la liste d'achat.
     * 
     * @returns la liste d'achat
     */
    getIngredients(): Ingredient[] {
        return this.ingredients.slice();
    }

    /**
     * Retourne l'ingrédient avec l'identifiant donné en paramètre.
     * 
     * @param index identifiant de l'ingrédient recherché
     * @returns l'ingrédient demmandé
     */
    getIngredient(index: number): Ingredient {
        return this.ingredients[index];
    }

    /**
     * Ajout d'un ingrédient à la liste d'achat.
     * 
     * @param ingredient ingrédient à ajouter
     */
    addIngredient(ingredient: Ingredient): void{
        this.manageIngredient(ingredient);
        this.sort();
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    /**
     * Ajout d'une liste d'ingrédients à la liste d'achat.
     * 
     * @param ingredients la liste d'ingrédients à ajouter
     */
    addIngredients(ingredients: Ingredient[]): void {
        for(const ingredient of ingredients){
            this.manageIngredient(ingredient);
        }

        this.sort();
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    /**
     * Modification d'un ingrédient de la liste d'achat.
     * 
     * @param index identifiant de l'ingrédient à modifier
     * @param ingredient le nouveau contneu de l'ingrédient
     */
    updateIngredient(index: number, ingredient: Ingredient): void {
        this.ingredients.splice(index, 1);
        this.addIngredient(ingredient); // Pour le cas où l'unité est changée et qu'il y a une autre ligne avec le même nom et unité, évite les doublons
    }

    /**
     * Supprimer un ingrédient de la liste d'achat.
     * 
     * @param index identifiant de l'ingrédient à supprimer
     */
    deleteIngredient(index: number): void {
        this.ingredients.splice(index, 1);
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    /**
     * Vide la liste d'achat.
     */
    clearIngredients(): void {
        this.ingredients = [];
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    /**
     * Gestion d'un ingrédient pour éviter les doublons.
     * 
     * @param ingredient ingrédient à ajouter/modifier selon le cas
     */
    private manageIngredient(ingredient: Ingredient): void {
        const index = this.ingredients.findIndex(i => i.name === ingredient.name && i.unit === ingredient.unit); // evite les doublons avec les mêmes noms et unités

        if(index === -1){ // l'ingrédient n'est pas dans la liste
            this.ingredients.push(ingredient);
        } else { // un ingrédient existe déjà avec le même nom et unité
            this.ingredients[index] = new Ingredient(ingredient.name, this.ingredients[index].quantity + +ingredient.quantity, ingredient.unit);
        }
    }
}
