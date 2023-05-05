import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

//* Property custom decorators
const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user;
    console.log({data});

    if(!user) throw new InternalServerErrorException('User not found (request)');

    return data ? user[data] : user;
});

const RawHeaders = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const {rawHeaders} = ctx.switchToHttp().getRequest();

    return rawHeaders;
});

export {
    GetUser,
    RawHeaders
}