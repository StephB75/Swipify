import { response } from "express"

console.log('yo')
// fetch('https://6f26-72-139-192-54.ngrok-free.app/db/webhook', {
fetch('http://localhost:8080/db/like', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        uid: 'd17aa379-824e-47b2-9f36-bc2664a2debf',
        liked_products: [
    {
        "name": "2017 Subaru BRZ.",
        "price": "FREE",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/510762051_23958004600518230_7463150192241924817_n.jpg?stp=c53.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=106&ccb=1-7&_nc_sid=247b10&_nc_ohc=vitoJ2SnUuQQ7kNvwHv2J3P&_nc_oc=AdlC3aZe06mzcBTTBG2FmOGqpFECDJItSgY5QkCxsSR0TZbbxPm7Rngn9IOUUDdN-lc&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfMLMuBdM1Q_Qqq0RnVckyhD3Woyu5oQTdynuVtnsq_3NA&oe=685D2072",
        "url": "www.facebook.com/marketplace/item/2174296036349391/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "MASSIVE COLLECTION of Pokemon Plush! Charizard, Eevee, Eeveelutions, Blastoise, Mew, Mewtwo! $10 ea",
        "price": "CA$10",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/498595888_683165417670232_7280312255878692394_n.jpg?stp=c170.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=106&ccb=1-7&_nc_sid=247b10&_nc_ohc=KWVe8cFvdhwQ7kNvwEm-vPV&_nc_oc=AdlyGGiiCRMGnjmpxMDrRt0b1XsjR9z5cZZleYjnHG_kmVJJJlbIKNKkJVgq5HI3gJM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfP1G5s65zjRYFAR5ABYhq4O5aFsqPsGYshwaFakt4sfbA&oe=685D1EDA",
        "url": "www.facebook.com/marketplace/item/923557669825536/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Labubu Macaron Flower Bouquet",
        "price": "CA$1",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/509271685_1031349992520147_6378060281591667395_n.jpg?stp=c0.159.261.261a_dst-jpg_p261x260_tt6&_nc_cat=102&ccb=1-7&_nc_sid=247b10&_nc_ohc=ddxDLPqDSo0Q7kNvwGG2ovQ&_nc_oc=Admd37yBLCeHRoTyHp3qUR9QRzYQuPtyXZiCoXNtFrroi_5FCO-Ihgh53AGNVhCndOM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOIeiTvzmvD8yMsHqw9aDvuG4w4vNRXbWx0zhMPqlVzfQ&oe=685D1B9A",
        "url": "www.facebook.com/marketplace/item/1789124378333841/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Custom Pikachu with The Starry Night",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/509271685_1031349992520147_6378060281591667395_n.jpg?stp=c0.159.261.261a_dst-jpg_p261x260_tt6&_nc_cat=102&ccb=1-7&_nc_sid=247b10&_nc_ohc=ddxDLPqDSo0Q7kNvwGG2ovQ&_nc_oc=Admd37yBLCeHRoTyHp3qUR9QRzYQuPtyXZiCoXNtFrroi_5FCO-Ihgh53AGNVhCndOM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOIeiTvzmvD8yMsHqw9aDvuG4w4vNRXbWx0zhMPqlVzfQ&oe=685D1B9A",
        "url": "www.facebook.com/marketplace/item/3831105483847204/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Selling girlfriend’s premium minifridge",
        "price": "CA$200",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/504256888_2129716747512915_6460000412218803529_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=107&ccb=1-7&_nc_sid=247b10&_nc_ohc=d_Ca6VbFvAwQ7kNvwGZ_dBE&_nc_oc=AdkUIihpXmbM13V8VZrU1Llfqa9hOCTw9JhogqzRC5Eby_DakiFw9ZrAgGMsPq3pjBc&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN1fNjt1p3sTTgtVrXFVV_x6yGYS7SNMyWeXaUj7GeRWA&oe=685D1D31",
        "url": "www.facebook.com/marketplace/item/725179179980411/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Nintendo switch games",
        "price": "CA$10",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/503476631_3602901323185981_3676655644822918299_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=109&ccb=1-7&_nc_sid=247b10&_nc_ohc=JlHlJgTVWgAQ7kNvwE0zIvT&_nc_oc=Adl40SsDMYPreeAlYfi71S-L5XPo94lA-87IsQvn_tFQSmIrGCBRaYDMtI_ONigdaQY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOlIqdxaljl8Yz_x8ZuCmOn5_m2LT4LNx9YRtYUeUWm4Q&oe=685CF176",
        "url": "www.facebook.com/marketplace/item/1720382691902820/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "White cotton bloomers (2T)",
        "price": "CA$1",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/498096314_748201820938482_5864884591827645088_n.jpg?stp=c0.151.261.261a_dst-jpg_p261x260_tt6&_nc_cat=104&ccb=1-7&_nc_sid=247b10&_nc_ohc=fvW3JEEUVlUQ7kNvwFQyowh&_nc_oc=AdlGRZWdLBMY6n8lNKe82QOTbOpR_kpSRMjEnVqfnR9Kv5PZx0OdV6szxlCh0u_vURQ&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOp1lKK1hlraxYRa07-r08-68j_5U87OxByM0AEqVNgYQ&oe=685CFE7A",
        "url": "www.facebook.com/marketplace/item/616118871446200/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "1985 Porsche 944",
        "price": "CA$7,000",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508107064_1214860816591307_7925823456754449552_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=LCnGISUbNhsQ7kNvwGLuM9z&_nc_oc=AdndY3FKaXtVroec1VAoHtUzVDs7tQWbJsyuvHDcPkWXm-x3CmxBoiG4rhb0HIMuPo4&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNQHv1S9hPgB0t-fhaAEv_sdG_BqUB9Dvk7ck1JVtbe6A&oe=685CFD4A",
        "url": "www.facebook.com/marketplace/item/713488591570807/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Store Closing (READ DESCRIPTION)",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/502685263_1386486745898812_1078503069197995514_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=i3PzP6zmJuoQ7kNvwGYdtIz&_nc_oc=Adlltrrn28F2sAxxPpr9XkDR8C_cdRJX9IhQfQ2fEv-MrlqgNkFgSQDn0lXvL7sM8VY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOMAwW0L-RlWFe3AG1_vXuAZAj_cLE3MhR7azt9dN5Q-g&oe=685D1DCF",
        "url": "www.facebook.com/marketplace/item/1233092698272192/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "5 Beds 7 Baths House",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/484550742_1423218492379224_8045045911961186767_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=eUB-d1th4VIQ7kNvwEDuSl3&_nc_oc=AdnPwN8yygXqPzxQccoNeYuGNc1ZDCfdJTYTU5GqWp4JK8-Vj0xszVYOQMwaAWeMKXA&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN7Jyg3osP2_jgb50Hpj_ETzFV5CP3XrJ16_kP4gazcsg&oe=685CFFBB",
        "url": "www.facebook.com/marketplace/item/1174137641018696/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "not sure what the inches are TV for sale has a faint red line in the right side works perfectly fi",
        "price": "CA$100",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/508748708_1455659525849654_4870266930669429643_n.jpg?stp=c151.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=101&ccb=1-7&_nc_sid=247b10&_nc_ohc=mewtlaMylXwQ7kNvwFe1cq5&_nc_oc=AdmlQhaSiqlmtl2hlMA5v_JMJUusZSIjcqyF5pP5zy2TT_wMPmD11Bll0TmanYaJfIY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN9I0-nu0WujIlGIBXQ9_QIdITq-wmfd2NRng_KhnjNQg&oe=685D0D71",
        "url": "www.facebook.com/marketplace/item/24506868118916412/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Kids’ Pikachu suits and sumo fighter inflatable suits",
        "price": "CA$40",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508745740_1251104686650930_1525843709270317651_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=108&ccb=1-7&_nc_sid=247b10&_nc_ohc=Rh17vg1i1VMQ7kNvwEmyEfJ&_nc_oc=Adk7ca0e9PD4JjxcNTHvtdvKvcKxmLBiewVdsbHsF1i1HaQLPLQ9TwWQBKe1ngNv_Xk&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNQVGr0C66PZaRj_fmiOdSCqVpXXcrRRkdam_ZK88Rr4g&oe=685D0054",
        "url": "www.facebook.com/marketplace/item/959395336197107/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "University of Toronto Tumbler",
        "price": "FREE",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508727337_1386510119231722_1174174643795412863_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=105&ccb=1-7&_nc_sid=247b10&_nc_ohc=Sw3MA-AJ1xQQ7kNvwGlW-nx&_nc_oc=Adme5sRgHonaBJoqIp8XCheoeON8b_bAhT_W2Jww53PY90979eoMGrYwCDEjtxc2gNA&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNWrrXe6eClFb53TljirTdlCJScZkCPtjAhM9cG0m6kEA&oe=685CFF2C",
        "url": "www.facebook.com/marketplace/item/2201422763644949/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Electric bike, YES IT'S AVAILABLE",
        "price": null,
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/496206010_657759463825358_124377558489792399_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=UXfUfMr-258Q7kNvwHOWPoZ&_nc_oc=AdmE9zXS7K2cRBpfJIfjA-8mRlmruOjKI9noeIv8RbBJUHW6D0MTFDMIWjJNLQ3NlCk&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOEoPWiiF_XWU-9DyAbHoQOaa1BKrFtjGAabd2evn2Vow&oe=685D0D05",
        "url": "www.facebook.com/marketplace/item/669071762652171/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Rainy Day in Bobcaygeon",
        "price": "CA$400",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/507568711_1634880380500177_6970595486746189939_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=1&ccb=1-7&_nc_sid=247b10&_nc_ohc=8oOKNKHU3MwQ7kNvwFsXlSP&_nc_oc=AdmLwWcs1TWNzJwvd7CltohuGCuqBwcbTo0cPIqBWPpC_VmX7tPKDKh6dftnZcjQZsU&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNw1nglLQt9f3fIXcpvQs5Vy9-R4ARyG6mqslc1g9vcPA&oe=685D065E",
        "url": "www.facebook.com/marketplace/item/1150326440472779/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Yoda backpack",
        "price": "CA$50",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/509771576_699572732704757_7918388899648466666_n.jpg?stp=c70.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=W6l-3pwXCQUQ7kNvwHUsAGF&_nc_oc=AdkftHSOKLZltHH92pW9VkFu5MNit0Jcgjta0Pz72Pl2m-lOApPmeJxkBOdrcCPcq-E&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNDEBgOr2bOqwS44KQ4fcMsBRTX52GCiFbSvbwYzMt_qw&oe=685CF220",
        "url": "www.facebook.com/marketplace/item/30881713021419501/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Twix cheesecake",
        "price": "CA$50",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/505710277_3082163808625285_5490962247118905515_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=1&ccb=1-7&_nc_sid=247b10&_nc_ohc=dlb7Q3rYbjUQ7kNvwF54TFC&_nc_oc=AdlfwPxBnbMwo0JV7THqYUCprDUe7qIojxwFBaBZV0xI6mNaPSRahNJ0rbxoe3CWIok&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfMFlhVn7J2nw_av6-OP5wi1c9KY9PeiDJe_Q61O9guFrA&oe=685D010C",
        "url": "www.facebook.com/marketplace/item/708200282143423/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    }
        ]
    })
})
// .then(()=> console.log(response))
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });