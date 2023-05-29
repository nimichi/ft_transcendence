import { Controller, Get, Query } from '@nestjs/common';
import { TfaService } from './tfa.service';
import * as speakeasy from 'speakeasy';

@Controller('tfa')
export class TfaController {}
