import { Component } from '@angular/core';

import { NavController, ActionSheetController, AlertController, Platform } from 'ionic-angular';
import { NativeStorage } from 'ionic-native';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage {

	// member vars
	startingBudget: number;
	budget: number;
	expenses: Array<{name: string, cost: string, selected: boolean}>;
	isCordova: boolean;
	nativeStorageAvailable: boolean;
	budgetColor: SafeStyle;

	constructor(public navCtrl: NavController, 
		public alertCtrl: AlertController, 
		public platform: Platform, 
		private sanitizer: DomSanitizer,
		public actionSheetCtrl: ActionSheetController
	) {
		this.budget = 0;
		this.startingBudget = 0;
		this.expenses = [];
		this.nativeStorageAvailable = platform.is('cordova');
		this.budgetColor = this.sanitizer.bypassSecurityTrustStyle('#23d19f');

		var _this = this;

		if(this.nativeStorageAvailable){
			NativeStorage.getItem('budget').then(function (loadedBudget) {
	        	if(!!loadedBudget){
	        		_this.budget = loadedBudget;
	        	}
	      	});

	      	NativeStorage.getItem('startingBudget').then(function (loadedStartingBudget) {
	        	if(!!loadedStartingBudget){
	        		_this.startingBudget = loadedStartingBudget;
	        	}
	      	});

	      	NativeStorage.getItem('expenses').then(function (loadedExpenses) {
	        	if(!!loadedExpenses){
	        		_this.expenses = loadedExpenses;
	        	}
	      	});
      	}	
	}

	unselectOtherExpenses(index){
		for(var i = 0; i < this.expenses.length; i++){
			if(i != index){
				this.expenses[i].selected = false;
			}
		}
	}

	confirmNewExpensePeriod() {
		let prompt = this.alertCtrl.create({
			title: 'New Expense Period',
			message: "Are you sure you wish to delete current period data and begin a new expense period?",
			buttons: [
				{
					text: 'No',
					handler: () => {} // do nothing
				},
				{
					text: 'Yes',
					handler: () => {
						this.startExpensePeriod();
					}
				}
			]
		});
		prompt.present();
	}

	startExpensePeriod(){
		var lastBudget = "";
		if(!!this.startingBudget && this.startingBudget != 0){
			lastBudget = this.startingBudget.toString();
		}

		let prompt = this.alertCtrl.create({
			title: 'Enter Budget',
			message: "Enter the budget you are allocating to this expense period.",
			inputs:[
				{
		        	name: 'budget',
		        	type: "number",
		        	placeholder: 'Budget',
		        	value: lastBudget		        }
			],
			buttons: [
				{
					text: 'Start',
					handler: data => {
						this.budget = Number(data.budget);
						this.startingBudget = Number(data.budget);
						this.expenses = [];

						if(this.nativeStorageAvailable){
							NativeStorage.setItem('budget', this.budget);
							NativeStorage.setItem('startingBudget', this.startingBudget);
							NativeStorage.setItem('expenses', this.expenses);
						}
					}
				}
			]
		});
		prompt.present();
	}

	addExpense() {
		let prompt = this.alertCtrl.create({
			title: 'Add Expense',
			message: "Enter the expense information.",
			inputs:[
				{
		        	name: 'name',
		        	placeholder: 'Expense Description'
		        },
		        {
		        	name: 'cost',
		        	type: "number",
		        	placeholder: '$'
		        }
			],
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {} // do nothing
				},
				{
					text: 'Add',
					handler: data => {
						this.budget -= data.cost;
						this.expenses.push({name: data.name, cost: Number(data.cost).toFixed(2), selected: false});

						if(this.nativeStorageAvailable){
							NativeStorage.setItem('budget', this.budget);
							NativeStorage.setItem('expenses', this.expenses);
						}
					}
				}
			]
		});
		prompt.present();
	}

	editExpense(item, index){
		var budgetWithoutThisItem = this.budget + Number(item.cost);
		let prompt = this.alertCtrl.create({
			title: 'Edit Expense',
			message: "Modify this expense's information.",
			inputs:[
				{
		        	name: 'name',
		        	value: item.name,
		        	placeholder: 'Expense Description'
		        },
		        {
		        	name: 'cost',
		        	value: item.cost,
		        	type: "number",
		        	placeholder: '$'
		        }
			],
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {} // do nothing
				},
				{
					text: 'Confirm',
					handler: data => {
						if(data.cost != item.cost){
							this.budget = budgetWithoutThisItem - Number(data.cost);
						}
						this.expenses[index] = {name: data.name, cost: Number(data.cost).toFixed(2), selected: false};

						if(this.nativeStorageAvailable){
							NativeStorage.setItem('budget', this.budget);
							NativeStorage.setItem('expenses', this.expenses);
						}
					}
				}
			]
		});
		prompt.present();
	}

	displayItemEditActionSheet(item, index){
		let actionSheet = this.actionSheetCtrl.create({
			title: 'Modify this expense',
			buttons: [
				{
				  text: 'Edit',
				  handler: () => {
				    this.editExpense(item, index);
				  }
				},{
				  text: 'Delete',
				  role: 'destructive',
				  handler: () => {
				  	this.displayDeleteItemConfirm(item, index);
				  }
				},{
				  text: 'Cancel',
				  role: 'cancel',
				  handler: () => { // do nothing
				  }
				}
			]
		});
		actionSheet.present();
	}

	displayDeleteItemConfirm(item, index){
		let prompt = this.alertCtrl.create({
			title: 'Delete item',
			message: 'Are you sure you wish to delete the item:  ' + item.name + '?',
			buttons: [
				{
					text: 'No',
					handler: () => {} // do nothing
				},
				{
					text: 'Yes',
					handler: () => {
						this.deleteItem(item, index);
					}
				}
			]
		});
		prompt.present();
	}

	deleteItem(item, index){
		this.budget += Number(item.cost);
		this.expenses.splice(index, 1);
	}
}
