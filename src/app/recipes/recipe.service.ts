import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { Ingredient } from "../shared/Ingredient.model";
import { Recipe } from "./recipe.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";

@Injectable({
    providedIn: "root"
})
export class RecipeService {
    recipesChanged = new Subject<Recipe[]>();
    private recipes: Recipe[] = [];

    constructor(private shoppingListService: ShoppingListService){}

    /**
     * Retourne une copie de la liste de recettes.
     * 
     * @returns la liste de recettes
     */
    getRecipes(): Recipe[] {
        return this.recipes.slice();
    }

    /**
     * Retourne la recette avec l'identifiant donné en paramètre.
     * 
     * @param id identifiant de la recette recherchée
     * @returns la recette demmandée
     */
    getRecipeById(id: number): Recipe {
        return this.recipes[id];
    }

    /**
     * Initialise la liste de recettes.
     * 
     * @param recipes la liste de recettes
     */
    setRecipes(recipes: Recipe[]): void {
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }
    
    /**
     * Ajoute une liste d'ingrédients à la liste d'achat.
     * 
     * @param ingredients liste d'ingrédients
     */
    addIngredientsToShoppingList(ingredients: Ingredient[]): void {
        this.shoppingListService.addIngredients(ingredients);
    }

    /**
     * Ajout d'une nouvelle recette à la liste.
     * 
     * @param recipe la nouvelle recette 
     */
    addRecipe(recipe: Recipe): void {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    /**
     * Modification d'une recette existante.
     * 
     * @param index identifiant de la recette à modifier
     * @param newRecipe le nouveau contenu de la recette
     */
    updateRecipe(index: number, newRecipe: Recipe): void {
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    /**
     * Supprime une recette de la liste.
     * 
     * @param index identifiant de la recette à supprimer
     */
    deleteRecipe(index: number): void {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}
