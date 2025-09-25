import { BaseEntity } from '@app/common'
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'


@Entity()
export class Nri extends BaseEntity {

@PrimaryGeneratedColumn('uuid')
id: string

@Column()
foodName: string

@Column()
description: string

@Column()
cook_time: string

@Column()
price: number

@Column()
image: string

@Column()
category: string

@CreateDateColumn()
createdAt: Date

@UpdateDateColumn()
updatedAt: Date
}