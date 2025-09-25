import { Injectable, Logger, NotFoundException }from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository }from 'typeorm'
import { Nri } from './schema/nri.schema'
import { AbstractPostgresRepository } from '@app/common'



Injectable()
export class NriRepository extends AbstractPostgresRepository<Nri> {
    protected readonly logger = new Logger(NriRepository.name)
    constructor(
        @InjectRepository(Nri) nriRepository: Repository<Nri>
    ){
        super(nriRepository)
    }
 
}
    