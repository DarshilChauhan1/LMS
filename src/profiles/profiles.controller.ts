import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseFilters, Put, SetMetadata } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CustomGuard } from 'src/permissions/custom.guard';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';
import { Guards } from 'src/common/enums/guards.enum';
import { ProtectedRoute } from 'src/common/decorators/UseCustomGuards.decorator';


@UseGuards(AuthGuardJWT, CustomGuard)
@ProtectedRoute()
@UseFilters(ExceptionHandling)
@Controller('api/v1')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  //get user profile
  @Get('profiles/get')
  getProfile(@Req() req : Request) {
    return this.profilesService.getProfile({userId : req['user'].id});
  }
  //add profile of the user
  @Post('profiles/add')
  addProfile(@Body() createProfileDto: CreateProfileDto, @Req() req : Request) {
    return this.profilesService.addProfile(createProfileDto, {userId : req['user'].id});
  }
  // update profile of the user
  @Put('profiles/:id')
  updateProfile(@Param('id') profileId: string, @Body() updateProfileDto: UpdateProfileDto, @Req() req : Request){
    return this.profilesService.updateProfile(updateProfileDto, {profileId, userId : req['user'].id});
  }

  //get all profiles only for admin
  @Get('admin/profiles/getAll')
  getAllProfiles(){
    return this.profilesService.getAllProfiles();
  }

}
