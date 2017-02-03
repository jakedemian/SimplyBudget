import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { NativeStorage } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

const GREEN_100_HEX = 0x23D19F;
const RED_0_HEX = 0xD1223A;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage {

	// member vars
	startingBudget: number;
	budget: number;
	expenses: Array<{name: string, cost: string}>;
	isCordova: boolean;
	nativeStorageAvailable: boolean;
	budgetColor: SafeStyle;

	constructor(public navCtrl: NavController, public alertCtrl: AlertController, public platform: Platform, private sanitizer: DomSanitizer) {
		this.budget = 0;
		this.startingBudget = 0;
		this.expenses = [];
		this.nativeStorageAvailable = platform.is('cordova');
		this.budgetColor = this.sanitizer.bypassSecurityTrustStyle('#23d19f');
		this.updateBudgetColor();

		if(this.nativeStorageAvailable){
			var _this = this;

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
		let prompt = this.alertCtrl.create({
			title: 'Enter Budget',
			message: "Enter the budget you are allocating to this expense period.",
			inputs:[
				{
		        	name: 'budget',
		        	placeholder: 'Budget'
		        }
			],
			buttons: [
				{
					text: 'Start',
					handler: data => {
						this.budget = Number(data.budget);
						this.startingBudget = Number(data.budget);
						this.expenses = [];
						this.updateBudgetColor();

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
			title: 'New Expense Period',
			message: "Are you sure you wish to delete current period data and begin a new expense period?",
			inputs:[
				{
		        	name: 'name',
		        	placeholder: 'Expense Description'
		        },
		        {
		        	name: 'cost',
		        	placeholder: '$'
		        }
			],
			buttons: [
				{
					text: 'Cancel',
					handler: () => {} // do nothing
				},
				{
					text: 'Add',
					handler: data => {
						this.budget -= data.cost;
						this.expenses.push({name: data.name, cost: data.cost});
						this.updateBudgetColor();

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

	updateBudgetColor(){
		var remainingBudgetPercentage = null;
		if(this.startingBudget != 0){
			return;
		}
		remainingBudgetPercentage = this.budget / this.startingBudget;

		// TODO FIXME come up with an algorithm to "calculate" the color 
		// of the budget based on how much is remaining

		this.budgetColor = this.sanitizer.bypassSecurityTrustStyle('#23d19f');
	}

}
