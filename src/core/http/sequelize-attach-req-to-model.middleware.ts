import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectConnection, } from "@nestjs/sequelize";
import { NextFunction, Request, Response } from 'express';
import { BulkCreateOptions, InstanceDestroyOptions, UpdateOptions } from 'sequelize';
import { Model, Sequelize } from "sequelize-typescript";

interface ModelCustom extends Model {
    request: Request
}
interface CreateOptionsCustom extends BulkCreateOptions {
    request: Request
}
interface UpdateOptionsCustom extends UpdateOptions {
    request: Request
}
interface DestroyOptionsCustom extends InstanceDestroyOptions {
    request: Request
}

@Injectable()
export class SequelizeAttachReqToModelMiddleware implements NestMiddleware {
    constructor(@InjectConnection() private readonly sequelize: Sequelize) { }

    use(req: Request, res: Response, next: NextFunction) {
        this.sequelize.beforeBulkCreate((instances, model: CreateOptionsCustom) => {
            model.request = req
        });
        this.sequelize.beforeCreate((model: ModelCustom) => {
            model.request = req
        });
        this.sequelize.beforeBulkUpdate((model: UpdateOptionsCustom) => {
            model.request = req
        });
        this.sequelize.beforeUpdate((model: ModelCustom, options) => {
            model.request = req
        });
        this.sequelize.Sequelize.beforeSave((model: ModelCustom, options) => {
            model.request = req
        });
        this.sequelize.beforeDestroy((model: ModelCustom, options) => {
            model.request = req
        });
        this.sequelize.beforeBulkDestroy((model: DestroyOptionsCustom) => {
            model.request = req
        });
        next();
    }
}