import { Component,
         OnInit } from '@angular/core';
import { AbstractControl,
         FormArray,
         FormControl,
         FormGroup,
         Validators } from '@angular/forms';
import { ActivatedRoute,
         Params,
         Router } from '@angular/router';
         
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id!: number;
  editMode: boolean = false;
  recipeForm!: FormGroup;

  constructor(private recipeService: RecipeService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;

        if(this.id && !this.recipeService.getRecipeById(this.id)){ // recette inexistante
          this.router.navigate(['/recipes'], { relativeTo: this.activatedRoute });
          return;
        }
        
        this.initForm();
      }
    );
  }

  get controls(): AbstractControl[] {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  /**
   * Initialisation du formulaire.
   */
  private initForm(): void {
    let recipeName = '';
    let recipeImageURL = '';
    let recipeDescription = '';
    const recipeIngredients = new FormArray([], [Validators.required, Validators.minLength(2)]);

    if(this.editMode){
      const recipe = this.recipeService.getRecipeById(this.id);

      recipeName  = recipe.name;
      recipeImageURL = recipe.imageURL;
      recipeDescription = recipe.description;

      if(recipe.ingredients){
        for(const ingredient of recipe.ingredients){
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(ingredient.name, Validators.required),
              quantity: new FormControl(ingredient.quantity, [
                Validators.required, 
                Validators.pattern(/^[1-9]+[0-9]*$/)
              ]),
              unit: new FormControl(ingredient.unit)
            })
          );
        }
      } 
    }

    if(recipeIngredients.length === 0){ // une recette comporte au minimum deux ingrédients
      for(let i = 0; i < 2; i++){
        recipeIngredients.push(
          new FormGroup({
            name: new FormControl(null, Validators.required),
            quantity: new FormControl(null, [
              Validators.required, 
              Validators.pattern(/^[1-9]+[0-9]*$/)
            ]),
            unit: new FormControl('')
          })
        )
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imageURL: new FormControl(recipeImageURL, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients: recipeIngredients
    });
  }

  /**
   * Soumission du formulaire de la recette.
   */
  onSubmit(): void {
    if(this.editMode){
      this.recipeService.updateRecipe(this.id, this.recipeForm.value);
    } else {
      this.recipeService.addRecipe(this.recipeForm.value);
    }

    this.onCancel();
  }

  /**
   * Ajout d'un champ de saisie pour un ingrédient.
   */
  onAddIngredient(): void {
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        quantity: new FormControl(null, [
          Validators.required, 
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ]),
        unit: new FormControl('')
      })
    )
  }

  /**
   * Annule l'action et/ou retour à la page précédente.
   */
  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  /**
   * Supprime le champ de saisie pour l'ingrédient sélectionné.
   */
  onDeleteIngredient(index: number): void {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  /**
   * Supprime tous les champs de saisie d'ingrédients.
   */
  onDeleteAllIngredients(): void {
    (this.recipeForm.get('ingredients') as FormArray).clear();
  }
}
