module.exports = class Data1667902800190 {
  name = 'Data1667902800190'

  async up(db) {
    await db.query(`CREATE TABLE "nft_transfer" ("id" character varying NOT NULL, "amount" numeric, "timestamp" numeric NOT NULL, "block" integer NOT NULL, "transaction_hash" text NOT NULL, "transfer_type" character varying(8), "token_id" character varying, "from_id" character varying, "to_id" character varying, CONSTRAINT "PK_2d9d4b37560ecbcae8bd13026ab" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_c769e593930b0d0f4a2ba07436" ON "nft_transfer" ("token_id") `)
    await db.query(`CREATE INDEX "IDX_e25e662117911bbbf337f8dcb6" ON "nft_transfer" ("from_id") `)
    await db.query(`CREATE INDEX "IDX_c84f5916ed381a97f68c9a8fc4" ON "nft_transfer" ("to_id") `)
    await db.query(`CREATE TABLE "account_nft_transfer" ("id" character varying NOT NULL, "direction" character varying(4), "transfer_id" character varying, "account_id" character varying, CONSTRAINT "PK_63cecb44d101ea1a54908c34a24" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_4574613e26a26d785fa5b8fe41" ON "account_nft_transfer" ("transfer_id") `)
    await db.query(`CREATE INDEX "IDX_4045ba623d506d713d74c4b74d" ON "account_nft_transfer" ("account_id") `)
    await db.query(`CREATE TABLE "f_token" ("id" character varying NOT NULL, "name" text, "symbol" text, "decimals" integer, CONSTRAINT "PK_da896c08df3022e579355d781b9" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_603b3fbd2a6038c5ae2fb820f1" ON "f_token" ("name") `)
    await db.query(`CREATE INDEX "IDX_797b629af41b1005b30650f3fb" ON "f_token" ("symbol") `)
    await db.query(`CREATE TABLE "ft_transfer" ("id" character varying NOT NULL, "amount" numeric, "timestamp" numeric NOT NULL, "block" integer NOT NULL, "transaction_hash" text NOT NULL, "transfer_type" character varying(8), "token_id" character varying, "from_id" character varying, "to_id" character varying, CONSTRAINT "PK_9197e98e6e5fc3ead382a4b80a3" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_41d6913b279f70b31c534bdcc7" ON "ft_transfer" ("token_id") `)
    await db.query(`CREATE INDEX "IDX_f4243fda4987918294ab60aec5" ON "ft_transfer" ("from_id") `)
    await db.query(`CREATE INDEX "IDX_f81105df1373810287fb884063" ON "ft_transfer" ("to_id") `)
    await db.query(`CREATE TABLE "account_ft_transfer" ("id" character varying NOT NULL, "direction" character varying(4), "transfer_id" character varying, "account_id" character varying, CONSTRAINT "PK_c806d331df157e95bfc5c97dc77" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_5d54de48e8ca8863e03a35faf7" ON "account_ft_transfer" ("transfer_id") `)
    await db.query(`CREATE INDEX "IDX_35cf1ac6d922fe093f515c54bb" ON "account_ft_transfer" ("account_id") `)
    await db.query(`CREATE TABLE "account_f_token_balance" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "updated_at_block" integer NOT NULL, "updated_at" numeric NOT NULL, "account_id" character varying, "token_id" character varying, CONSTRAINT "PK_c5ff211ac7ea9f25010a8ceab68" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_c94a455c79cf9d35a3873076f0" ON "account_f_token_balance" ("account_id") `)
    await db.query(`CREATE INDEX "IDX_44e2e4a887e960bf7b969e2893" ON "account_f_token_balance" ("token_id") `)
    await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "contract" ("id" character varying NOT NULL, "contract_standard" character varying(7) NOT NULL, "created_at_block" numeric NOT NULL, "created_at" numeric NOT NULL, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_aeb93e2de2f292364d10dc1196" ON "contract" ("contract_standard") `)
    await db.query(`CREATE TABLE "nf_token" ("id" character varying NOT NULL, "name" text, "symbol" text, "uri" text, "amount" numeric NOT NULL, "owner_id" character varying, "contract_id" character varying, CONSTRAINT "PK_4b875f332d287d53286f0120060" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_fed8ee45d369b30b8306dd54a6" ON "nf_token" ("owner_id") `)
    await db.query(`CREATE INDEX "IDX_4dc22b6150f30b075a8b0c6acb" ON "nf_token" ("contract_id") `)
    await db.query(`ALTER TABLE "nft_transfer" ADD CONSTRAINT "FK_c769e593930b0d0f4a2ba074367" FOREIGN KEY ("token_id") REFERENCES "nf_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "nft_transfer" ADD CONSTRAINT "FK_e25e662117911bbbf337f8dcb62" FOREIGN KEY ("from_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "nft_transfer" ADD CONSTRAINT "FK_c84f5916ed381a97f68c9a8fc4e" FOREIGN KEY ("to_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_nft_transfer" ADD CONSTRAINT "FK_4574613e26a26d785fa5b8fe418" FOREIGN KEY ("transfer_id") REFERENCES "nft_transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_nft_transfer" ADD CONSTRAINT "FK_4045ba623d506d713d74c4b74d3" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "ft_transfer" ADD CONSTRAINT "FK_41d6913b279f70b31c534bdcc75" FOREIGN KEY ("token_id") REFERENCES "f_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "ft_transfer" ADD CONSTRAINT "FK_f4243fda4987918294ab60aec5e" FOREIGN KEY ("from_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "ft_transfer" ADD CONSTRAINT "FK_f81105df1373810287fb884063f" FOREIGN KEY ("to_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_ft_transfer" ADD CONSTRAINT "FK_5d54de48e8ca8863e03a35faf73" FOREIGN KEY ("transfer_id") REFERENCES "ft_transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_ft_transfer" ADD CONSTRAINT "FK_35cf1ac6d922fe093f515c54bb4" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_f_token_balance" ADD CONSTRAINT "FK_c94a455c79cf9d35a3873076f0e" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "account_f_token_balance" ADD CONSTRAINT "FK_44e2e4a887e960bf7b969e2893d" FOREIGN KEY ("token_id") REFERENCES "f_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "nf_token" ADD CONSTRAINT "FK_fed8ee45d369b30b8306dd54a65" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "nf_token" ADD CONSTRAINT "FK_4dc22b6150f30b075a8b0c6acb4" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "nft_transfer"`)
    await db.query(`DROP INDEX "public"."IDX_c769e593930b0d0f4a2ba07436"`)
    await db.query(`DROP INDEX "public"."IDX_e25e662117911bbbf337f8dcb6"`)
    await db.query(`DROP INDEX "public"."IDX_c84f5916ed381a97f68c9a8fc4"`)
    await db.query(`DROP TABLE "account_nft_transfer"`)
    await db.query(`DROP INDEX "public"."IDX_4574613e26a26d785fa5b8fe41"`)
    await db.query(`DROP INDEX "public"."IDX_4045ba623d506d713d74c4b74d"`)
    await db.query(`DROP TABLE "f_token"`)
    await db.query(`DROP INDEX "public"."IDX_603b3fbd2a6038c5ae2fb820f1"`)
    await db.query(`DROP INDEX "public"."IDX_797b629af41b1005b30650f3fb"`)
    await db.query(`DROP TABLE "ft_transfer"`)
    await db.query(`DROP INDEX "public"."IDX_41d6913b279f70b31c534bdcc7"`)
    await db.query(`DROP INDEX "public"."IDX_f4243fda4987918294ab60aec5"`)
    await db.query(`DROP INDEX "public"."IDX_f81105df1373810287fb884063"`)
    await db.query(`DROP TABLE "account_ft_transfer"`)
    await db.query(`DROP INDEX "public"."IDX_5d54de48e8ca8863e03a35faf7"`)
    await db.query(`DROP INDEX "public"."IDX_35cf1ac6d922fe093f515c54bb"`)
    await db.query(`DROP TABLE "account_f_token_balance"`)
    await db.query(`DROP INDEX "public"."IDX_c94a455c79cf9d35a3873076f0"`)
    await db.query(`DROP INDEX "public"."IDX_44e2e4a887e960bf7b969e2893"`)
    await db.query(`DROP TABLE "account"`)
    await db.query(`DROP TABLE "contract"`)
    await db.query(`DROP INDEX "public"."IDX_aeb93e2de2f292364d10dc1196"`)
    await db.query(`DROP TABLE "nf_token"`)
    await db.query(`DROP INDEX "public"."IDX_fed8ee45d369b30b8306dd54a6"`)
    await db.query(`DROP INDEX "public"."IDX_4dc22b6150f30b075a8b0c6acb"`)
    await db.query(`ALTER TABLE "nft_transfer" DROP CONSTRAINT "FK_c769e593930b0d0f4a2ba074367"`)
    await db.query(`ALTER TABLE "nft_transfer" DROP CONSTRAINT "FK_e25e662117911bbbf337f8dcb62"`)
    await db.query(`ALTER TABLE "nft_transfer" DROP CONSTRAINT "FK_c84f5916ed381a97f68c9a8fc4e"`)
    await db.query(`ALTER TABLE "account_nft_transfer" DROP CONSTRAINT "FK_4574613e26a26d785fa5b8fe418"`)
    await db.query(`ALTER TABLE "account_nft_transfer" DROP CONSTRAINT "FK_4045ba623d506d713d74c4b74d3"`)
    await db.query(`ALTER TABLE "ft_transfer" DROP CONSTRAINT "FK_41d6913b279f70b31c534bdcc75"`)
    await db.query(`ALTER TABLE "ft_transfer" DROP CONSTRAINT "FK_f4243fda4987918294ab60aec5e"`)
    await db.query(`ALTER TABLE "ft_transfer" DROP CONSTRAINT "FK_f81105df1373810287fb884063f"`)
    await db.query(`ALTER TABLE "account_ft_transfer" DROP CONSTRAINT "FK_5d54de48e8ca8863e03a35faf73"`)
    await db.query(`ALTER TABLE "account_ft_transfer" DROP CONSTRAINT "FK_35cf1ac6d922fe093f515c54bb4"`)
    await db.query(`ALTER TABLE "account_f_token_balance" DROP CONSTRAINT "FK_c94a455c79cf9d35a3873076f0e"`)
    await db.query(`ALTER TABLE "account_f_token_balance" DROP CONSTRAINT "FK_44e2e4a887e960bf7b969e2893d"`)
    await db.query(`ALTER TABLE "nf_token" DROP CONSTRAINT "FK_fed8ee45d369b30b8306dd54a65"`)
    await db.query(`ALTER TABLE "nf_token" DROP CONSTRAINT "FK_4dc22b6150f30b075a8b0c6acb4"`)
  }
}