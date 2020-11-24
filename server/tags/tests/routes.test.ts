// @ts-nocheck
import "mocha";
import { expect } from "chai";
import request from "supertest";
import * as authHandler from "../../auth-handler";
import sinon from "sinon";
import express, { Express } from "express";
import { Server } from "http";


import debug from "debug";
const log = debug("bobaserver:tags:routes");
let authStub;
import router from "../routes";

const FAVE_TO_MAIM_POST_ID = "11b85dac-e122-40e0-b09a-8829c5e0250e";
const REVOLVER_OCELOT_POST_ID = "619adf62-833f-4bea-b591-03e807338a8e";
const KERMIT_THE_FROG_POST_ID = "b95bb260-eae0-456c-a5d0-8ae9e52608d8";

describe("Tests tags REST API", () => {
  let app: Express;
  let listener: Server;
  before(function (done) {
    authStub = sinon.stub(authHandler, "isLoggedIn");
  });
  beforeEach(function (done) {
    authStub.callsFake((req, res, next) => {
      next();
    });
    authStub.callsFake((req, res, next) => {
      // @ts-ignore
      req.currentUser = { uid: "fb3" };
      next();
    });
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
  });
  afterEach(function (done) {
    authStub.restore();
    listener.close(done);
  });
  after(function() {
    authStub.restore();
  });

  it("should get fields correctly for user fb3 ", async() => {
    const res = await request(app).get("/search?tags=bobapost");
    expect(res.body.length).to.equal(3);
    const posts_by_id: any = {};
    for(let post of res.body ) {
      // @ts-ignore
      posts_by_id[post.post_info.post_id] = {
        post_info: post.post_info,
        parent_post_info: post.parent_post_info
      };
    }
    const maim_post_info = {
       "post_id": "11b85dac-e122-40e0-b09a-8829c5e0250e",                                                                                                             
       "created": "2020-04-30T03:23:00",                                                                                                                              
       "content": "[{\"insert\":\"Favorite character to maim?\"}]",                                                                                                   
       "options": {},                                                                                                                                                 
       "type": "text",                                                                                                                                                
       "self": true,                                                                                                                                                  
       "friend": false,                                                                                                                                               
       "child_posts_count": 2,                                                                                                                                        
       "child_comments_count": 0,                                                                                                                                     
       "user_identity": {                                                                                                                                             
         "name": "oncest5evah",                                                                                                                                       
         "avatar": "/greedler.jpg"                                                                                                                                    
       },                                                                                                                                                             
       "secret_identity": {                                                                                                                                           
         "name": "DragonFucker",                                                                                                                                      
         "avatar": "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg"                                                                            
       },  
        // @ts-ignore
       "comments" : null,
    } 
    // @ts-ignore
    const ocelot_post_info = {
          "post_id": '619adf62-833f-4bea-b591-03e807338a8e',                                                                                                               
          "created": '2020-05-01T05:42:00',                                                                                                                                
          "content": '[{"insert":"Revolver Ocelot"}]',                                                                                                                     
          "options": {},                                                                                                                                                   
          "type": 'text',                                                                                                                                                  
          self: false,                                                                                                                                                   
          "friend": true,                                                                                                                                                  
          "child_posts_count": 0,                                                                                                                                          
          "child_comments_count": 0,                                                                                                                                       
          "user_identity": {
            "name": "bobatan",
            "avatar" : "/bobatan.png"
          },
          "secret_identity": {
            "name": "Old Time-y Anon",
            "avatar" : "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png"
          },
          // @ts-ignore
          "comments": null                                                                                                                                                
    }
    expect(posts_by_id[REVOLVER_OCELOT_POST_ID].post_info).to.deep.include(ocelot_post_info);
    expect(posts_by_id[REVOLVER_OCELOT_POST_ID].parent_post_info).to.deep.include(maim_post_info);

    expect(posts_by_id[FAVE_TO_MAIM_POST_ID].post_info).to.deep.include(maim_post_info);
    expect(posts_by_id[FAVE_TO_MAIM_POST_ID].parent_post_info).to.deep.equal({});


  });

  it("should hide identity info from non-friends/non-self posts", async() => {
    authStub.restore();
    authStub.callsFake((req, res, next) => {
      // @ts-ignore
      req.currentUser = { uid: "fb4" };
      next();
    });
    const res = await request(app).get("/search?tags=bobapost");
    const posts_by_id: any = {};
    for(let post of res.body ) {
      // @ts-ignore
      posts_by_id[post.post_info.post_id] = {
        post_info: post.post_info,
        parent_post_info: post.parent_post_info
      };
    }
    expect(posts_by_id[REVOLVER_OCELOT_POST_ID].post_info.user_identity).to.be.a('undefined');
    expect(posts_by_id[REVOLVER_OCELOT_POST_ID].parent_post_info.user_identity).to.be.a('undefined');
  });

  it("should work with both one tags and one excludes", async () => {
    const res = await request(app).get("/search?tags=evil&exclude=oddly+specific");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);
    expect(res.body[0].post_info.post_id).to.equal(FAVE_TO_MAIM_POST_ID); // favorite character to maim?
  });
  

  it("should work with one tags only", async () => {
    const res = await request(app).get("/search?tags=evil");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(2);

    const responsePostIds = new Set(res.body.map( (r: any) => r.post_info.post_id ));

    expect(responsePostIds.has(FAVE_TO_MAIM_POST_ID)).to.be.true;
    expect(responsePostIds.has(REVOLVER_OCELOT_POST_ID)).to.be.true;
  });
   

  
  it("should send 400 if no tags and exclude", async () => {
    const res = await request(app).get("/search?exclude=evil");
    expect(res.status).to.equal(400);
  });

  it("should send 400 if no tags and no exclude", async () => {
    const res = await request(app).get("/search");
    expect(res.status).to.equal(400);
  });

  
  it("should work with multiple tags, returning posts that have ALL specified tags", async () => {
    const res = await request(app).get("/search?tags=oddly+specific&tags=good");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);

    const responsePostIds = new Set(res.body.map( (r: any) => r.post_info.post_id ));

    expect(responsePostIds.has(KERMIT_THE_FROG_POST_ID)).to.be.true;
  });
   

  
  it("should work with multiple excludes, not returning posts that have ANY specified tags", async () => {
    const res = await request(app).get("/search?tags=bobapost&exclude=oddly+specific&exclude=metal+gear");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);

    const responsePostIds = new Set(res.body.map( (r: any) => r.post_info.post_id ));

    expect(responsePostIds.has(FAVE_TO_MAIM_POST_ID)).to.be.true;
  });
   

});
