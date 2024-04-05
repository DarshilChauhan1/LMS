import { User, UserSchema } from "../entities/user.entity";
import * as bcrypt from 'bcrypt'

export const PasswordSave = {
    name: User.name,
    useFactory: () => {
      const schema = UserSchema;
      schema.pre('save', async function () {
        if(!this.isModified('password')) return ;
        this.password = await bcrypt.hash(this.password, 10);
      });
      return schema;
    },
  } 