# ThreeGame

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


node_modules\@types\three\examples\jsm\controls\OrbitControls.d.ts
    /**
     * Rotate camera
     * @param rotateX - X
     * @param rotateY - Y
     */
    rotate(rotateX:number, rotateY:number): void;
node_modules\three\examples\jsm\controls\OrbitControls.js
this.rotate = function(rotateX, rotateY) {
			// rotateX angle to mouse X
			let element = scope.domElement;
			let x = (rotateX * element.clientHeight) / (Math.PI * 2);
			// rotateY angle to mouse Y
			let y = (rotateY * element.clientHeight) / (Math.PI * 2);
			// Add to previous mouse point
			x = rotateStart.x + x;
			y = rotateStart.y + y;
			handleMouseMoveRotate({clientX: x, clientY: y});
	 	};