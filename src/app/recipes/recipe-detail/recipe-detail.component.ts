import { Component,
         OnInit } from '@angular/core';
import { ActivatedRoute,
         Params,
         Router } from '@angular/router';
         
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe!: Recipe;
  id!: number;
  
  constructor(private recipeService: RecipeService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.recipe = this.recipeService.getRecipeById(this.id);

        if(!this.recipe){ // la recette n'existe pas
          this.router.navigate(['/recipes'], { relativeTo: this.activatedRoute });
        }
      }
    )
  }

  /**
   * Ajoute les ingrédients de la recette à la liste d'achat.
   */
  addIngredientsToList(): void {
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  /**
   * Modification de la recette.
   */
  onEditRecipe(): void {
    this.router.navigate(['edit'], { relativeTo: this.activatedRoute });
  }

  /**
   * Supprimer la recette.
   */
  onDeleteRecipe(){
    if(confirm('Voulez-vous vraiment supprimer la recette ' + this.recipe.name + ' ?')){
      this.recipeService.deleteRecipe(this.id);
      this.router.navigate(['/recipes'], { relativeTo: this.activatedRoute });
    }
  }
}
