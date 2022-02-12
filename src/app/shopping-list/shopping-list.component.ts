import { Component,
         OnDestroy,
         OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Ingredient } from '../shared/Ingredient.model';
import { ShoppingListService } from './shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients!: Ingredient[];
  private ingChangeSub!: Subscription;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit(): void {
    this.ingChangeSub = this.shoppingListService.ingredientsChanged.subscribe(
      (ingredients) => this.ingredients = ingredients
    )
    this.ingredients = this.shoppingListService.getIngredients();
  }

  /**
   * Modification d'un ingrédient de la liste d'achat.
   * 
   * @param index identifiant de l'ingrédient à modifier
   */
  onEditIngredient(index: number): void {
    this.shoppingListService.startedEditing.next(index);
  }

  onClearIngredients(): void {
    this.shoppingListService.clearIngredients();
  }

  ngOnDestroy(): void {
    this.ingChangeSub.unsubscribe();
  }
}
