import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'default-passive-events';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// 引入这个会导致drop移动报错 drag-drop.mjs:461 Unable to preventDefault inside passive event listener invocation.
// import 'default-passive-events';

// 复写 Flat
window.Array.prototype.flat = function (depth: number = 1) {
  return (this as Array<any>).reduce((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(val.flat(depth - 1));
    } else {
      return acc.concat(val);
    }
  }, []);
};
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
