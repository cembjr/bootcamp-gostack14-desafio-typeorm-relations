import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('ICustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    try {
      const customerExists = await this.customersRepository.findByEmail(email);

      if (customerExists) throw new AppError('Customer already exists', 400);

      const customer = await this.customersRepository.create({ name, email });
      return customer;
    } catch (ex) {
      throw new AppError('Ocorreu um erro ao cadastrar');
    }
  }
}

export default CreateCustomerService;
