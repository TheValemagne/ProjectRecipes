import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map,
         tap } from "rxjs/operators";

import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";

@Injectable({
    providedIn: "root"
})
export class DataStorageService {
    private firebaseURL = 'https://projectcookie-9901b-default-rtdb.firebaseio.com/';

    constructor(private http: HttpClient,
                private recipeService: RecipeService){}

    /**
     * Enregistrement de la liste de recette dans la base de données.
     */
    storeRecipes(): void {
        const recipes = this.recipeService.getRecipes();
        this.http
            .put(this.firebaseURL + 'recipes.json', recipes)
            .subscribe();
    }

    /**
     * Récupère la liste de recettes enregistrée dans la base de données.
     * 
     * @returns la liste de recettes
     */
    retrieveRecipes(): Observable<Recipe[]> {
        return this.http
                    .get<Recipe[]>(this.firebaseURL + 'recipes.json')
                    .pipe(
                        map(
                            recipes => {
                                return recipes.map(
                                    recipe => {
                                        return {
                                            ...recipe, 
                                            ingredients: recipe.ingredients? recipe.ingredients : [] 
                                        };
                                    }
                                );
                            }
                        ),
                        tap(
                            recipes => this.recipeService.setRecipes(recipes)
                        )
                    );
    }
}
