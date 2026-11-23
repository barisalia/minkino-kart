import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',workers:2,timeout:90000,use:{baseURL:'http://localhost:5173',launchOptions:{channel:'msedge'},viewport:{width:900,height:520},hasTouch:true},reporter:'list'});
