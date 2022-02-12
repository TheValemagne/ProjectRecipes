import { Component,
         OnDestroy,
         OnInit,
         ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Ingredient } from 'src/app/shared/Ingredient.model';
import { ShoppingListService } from '../shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') shoppingListForm!: NgForm;
  subscription!: Subscription;
  editedIngredientIndex!: number;
  editedIngredient!: Ingredient;
  editMode: boolean = false;

  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing.subscribe( // initialisation du formulaire avec les données de l'ingrédient pour une modification
      (index: number) =>{
         this.editedIngredientIndex = index;
         this.editMode = true;
         this.editedIngredient = this.shoppingListService.getIngredient(index);

         this.shoppingListForm.setValue({
           name: this.editedIngredient.name,
           quantity: this.editedIngredient.quantity,
           unit: this.editedIngredient.unit
         })
      }
    );
  }

  /**
   * Ajout/modification de l'ingrédient.
   */
  onAddEditIngredient(): void {
    const value = this.shoppingListForm.value;
    const ingredient = new Ingredient(value.name, value.quantity, value.unit);

    if(this.editMode){
      this.shoppingListService.updateIngredient(this.editedIngredientIndex, ingredient);
    } else {
      this.shoppingListService.addIngredient(ingredient);
    }
    
    this.onReset();
  }

  /**
   * Supprimer l'ingrédient.
   */
  onDelete(): void {
    this.shoppingListService.deleteIngredient(this.editedIngredientIndex);
    this.onReset();
  }

  /**
   * Remise à zéro du formulaire de gestion d'ingrédient.
   */
  onReset(): void {
    this.editMode = false;
    this.shoppingListForm.reset({unit: ''});
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
