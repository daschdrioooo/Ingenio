const SUPABASE_URL="https://lolwqegcyffrtnszlfvj.supabase.co";
const SUPABASE_KEY="sb_publishable_4B46vXrdTXlNPtK5SanbBA_abwSM9iS";//publishable key :)
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const PAGES={
    hero:"../hero/hero.html",
    login:"../login/login.html",
    signup:"../signup/signup.html",
    setup:"../setup/setup.html",
    home:"../home/home.html",
};

function go(page) {
    window.location.href=PAGES[page];   
}

function pageUrl(page) {
    return new URL(PAGES[page],window.location.href).href;
}

async function getProfile(userId) {
    const {data,error} = await sb.from("profiles").select("*").eq("id",userId).maybeSingle();
    if (error) throw error;
    return data;
}

async function routeSignedInUser(user) {
    try {
        const profile=await getProfile(user.id);
        go(profile?"home":"setup");
    } catch {
        go("setup");
    }
}