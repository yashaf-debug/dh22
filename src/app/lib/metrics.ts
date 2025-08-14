type AnyObj = Record<string, any>;

const YM_ID = 103743080;

export function reachGoal(name: string, params: AnyObj = {}) {
  try {
    (window as any).ym?.(YM_ID, 'reachGoal', name, params);
  } catch {}
}

export function dlPush(obj: AnyObj) {
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(obj);
  } catch {}
}

export function evViewItem(p: {id:string; name:string; price:number; category?:string}) {
  dlPush({ ecommerce: { detail: { products:[{ id:p.id, name:p.name, price:p.price, category: p.category||'' }] } } });
  reachGoal('view_item', p);
}
export function evAddToCart(p: {id:string; name:string; price:number; qty:number}) {
  dlPush({ ecommerce: { add: { products:[{ id:p.id, name:p.name, price:p.price, quantity:p.qty }] } } });
  reachGoal('add_to_cart', p);
}
export function evBeginCheckout(sum:number) {
  dlPush({ ecommerce: { checkout: { actionField:{ step:1 }, products:[] } } });
  reachGoal('begin_checkout', { sum });
}
export function evSelectPVZ(code:string, address:string) {
  reachGoal('select_pvz', { code, address });
}
export function evPaymentMethod(name:'online'|'cod') {
  reachGoal('payment_method_selected', { name });
}
export function evPurchase(order:{number:string; revenue:number; shipping:number; items:Array<{id:string; name:string; price:number; qty:number}>}) {
  dlPush({
    ecommerce: {
      purchase: {
        actionField:{ id: order.number, revenue: order.revenue, shipping: order.shipping },
        products: order.items.map(i=>({ id:i.id, name:i.name, price:i.price, quantity:i.qty }))
      }
    }
  });
  reachGoal('purchase', { number: order.number, revenue: order.revenue });
}
