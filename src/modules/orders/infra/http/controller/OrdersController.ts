import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    console.log('show');

    const { id } = request.params;
    console.log(id);

    const orders = container.resolve(FindOrderService);
    const order = await orders.execute({ id });
    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const orders = container.resolve(CreateOrderService);
    const order = await orders.execute({ customer_id, products });
    return response.json(order);
  }
}
