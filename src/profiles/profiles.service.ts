import { BadRequestException, Injectable, Res } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './entities/profile.entity';
import { User } from 'src/users/entities/user.entity';
import { ResponseBody } from 'src/helpers/helper';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel('User') private readonly userModel : Model<User>,
    @InjectModel('Profile') private readonly profileModel : Model<Profile>){}

  
  async getProfile(user : {userId : string}) {
    try {
      const {userId} = user;
      // check of the user exists in database
      const checkUser = await this.userModel.findById(userId);
      if(!checkUser) throw new BadRequestException('User not found');
      // check if the user has a profile
      const userProfile = await this.profileModel.findOne({student_id : userId}).populate('student_id', '-refreshToken')
      if(!userProfile) throw new BadRequestException('Profile not found');
      return new ResponseBody(200, 'Profile Fetched Successfully', userProfile, true);

    } catch (error) {
      throw error
    }
  }

  async addProfile(payload: CreateProfileDto, user : {userId : string}) {
    try {
      const {firstName, lastName, standard} = payload;
      const {userId} = user;
      if(firstName && lastName && standard){
        // for security check if the user exits in database or not
        const checkUser = await this.userModel.findById(userId);
        if(!checkUser) throw new BadRequestException('User not found');
        // check if the user already has a profile
        const checkProfile = await this.profileModel.findOne({student_id : userId});
        if(checkProfile) throw new BadRequestException('Profile already exists');

        // create new profile
        const newProfile = await this.profileModel.create({firstname : firstName, lastname : lastName, standard, student_id : userId});
        return new ResponseBody(201, 'Profile Created Successfully', newProfile, true);
      } else {
        throw new BadRequestException('All fields are required');
      }
    } catch (error) {
      throw error
    }
  }

  async updateProfile(payload: UpdateProfileDto, user : {userId : string, profileId : string}) {
    try {
      const {profileId, userId} = user
      //checking that the owner of the profile is updating the profile
      const findProfile = await this.profileModel.findOne({student_id : userId, _id : profileId});
      if(!findProfile) throw new BadRequestException('Profile not found');
      // update the profile
      const updatedProfile = await this.profileModel.findByIdAndUpdate(profileId, {
        $set : {...payload}
      }, {new : true});

      return new ResponseBody(200, 'Profile Updated Successfully', updatedProfile, true);
      
    } catch (error) {
      throw error
    }
  }


  async getAllProfiles() {
    try {
      const getAllUsers = await this.profileModel.find().populate('student_id', 'username email');
      return new ResponseBody(200, 'Profiles Fetched Successfully', getAllUsers, true);
    } catch (error) {
      throw error
    }
  }
}
