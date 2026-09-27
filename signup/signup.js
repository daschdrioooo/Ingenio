lucide.createIcons();
const form=document.getElementById("signupForm");
const email=document.getElementById("email");
const password=document.getElementById("password");
const submitBtn=document.getElementById("submitBtn");
const formAlert=document.getElementById("formAlert");
const signupCard=document.getElementById("signupCard");
const sentCard=document.getElementById("sentCard");
const sentEmail=document.getElementById("sentEmail");
const resendBtn=document.getElementById("resendBtn");
const changeEmail=document.getElementById("changeEmail");
const togglePw=document.getElementById("togglePw");

sb.auth.getSession().then(({data})=>{
    if (data.session) routeSignedInUser(data.session.user);
});

togglePw.addEventListener("click",()=>{
    const showing=password.type==="text";
    password.type=showing?"password":"text";
    togglePw.classList.toggle("showing",!showing);
    password.focus();
});

function setError(fieldId,message) {
    const field=document.getElementById(fieldId);
    field.classList.toggle("has-error",Boolean(message));
    field.querySelector(".error span").textContent=message||"";
}

function setAlert(message) {
    formAlert.classList.toggle("show",Boolean(message));
    formAlert.querySelector("span").textContent=message||"";
}

function setLoading(on) {
    submitBtn.classList.toggle("loading",on);
    submitBtn.disabled=on;
}

function validate() {
    let ok=true;
    const emailVal=email.value.trim();
    if (!emailVal) {
        setError("emailField","Enter your email address");
        ok=false;
    } else setError("emailField","");
    if (!password.value){setError("passwordField","Create a password");ok=false;}
    else if (password.value.length<8) {setError("passwordField","Use at least 8 characters");ok=false;}
    else setError("passwordField","");
    return ok;
}

email.addEventListener("input",()=>{
    setError("emailField","");
    setAlert("");
});

password.addEventListener("input",()=>{
    setError("passwordField","");
    setAlert("");
});

form.addEventListener("submit",async (e)=>{
    e.preventDefault();
    setAlert("");
    if (!validate()) {
        form.querySelector(".has-error .input").focus();
        return;
    }
    setLoading(true);
    const {data,error}=await sb.auth.signUp({
        email:email.value.trim(),
        password:password.value,
        options:{emailRedirectTo:pageUrl("setup")},
    });
    setLoading(false);
    if (error) {
        if (error.code==="weak_password") {
            setError("passwordField","That password is wayyyy too easy to guess bucko. Do something more complex.");
        } else if (error.code==="email_address_invalid") {
            setError("emailField","That email address can't be used. Try another.");
        } else if (error.code==="over_email_send_rate_limit") {
            setAlert("Too many sign-up emails sent. Wait a minute and try again.");
        } else {
            setAlert("Couldn't create an account - try checking your connection.");
            console.error(error);
        }
        return;
    }
    if (data.user&&data.user.identities&&data.user.identities.length===0) {
        setError("emailField","There's already an account with this email, log in instead.");
        return;
    }
    if (data.session) {
        go("setup");
        return;
    }
    showSent(email.value.trim());
});

function showSent(address) {
    sentEmail.textContent=address;
    signupCard.hidden=true;
    sentCard.hidden=false;
}

resendBtn.addEventListener("click",async()=>{
    resendBtn.disabled=true;
    resendBtn.textContent="Sending...";
    const {error}=await sb.auth.resend({
        type:"signup",
        email:sentEmail.textContent,
        options:{emailRedirectTo:pageUrl("setup")},
    });
    resendBtn.textContent=error?"Couldn't resend. Try again in a minute.":"Sent! Check your inbox :)";
    setTimeout(()=>{
        resendBtn.textContent="Resend email";
        resendBtn.disabled=false;
    },30000);
});

changeEmail.addEventListener("click",(e)=>{
    e.preventDefault();
    sentCard.hidden=true;
    signupCard.hidden=false;
    email.focus();
    email.select();
});