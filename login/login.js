lucide.createIcons();
const form=document.getElementById("loginForm");
const email=document.getElementById("email");
const password=document.getElementById("password");
const submitBtn=document.getElementById("submitBtn");
const togglePw=document.getElementById("togglePw");
const formAlert=document.getElementById("formAlert");

sb.auth.getSession().then(({data})=>{
    if (data.session) routeSignedInUser(data.session.user);
});

togglePw.addEventListener("click",()=>{
    const showing=password.type==="text";
    password.type=showing?"password":"text";
    togglePw.classList.toggle("showing",!showing);
    togglePw.setAttribute("aria-label",showing?"Show password":"Hide password");
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError("emailField","That doesn't look like a valid email address");
        ok=false;
    } else setError("emailField","");
    if (!password.value) {
        setError("passwordField","Enter your password");
        ok=false;
    } else setError("passwordField","");
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

form.addEventListener("submit",async(e)=>{
    e.preventDefault();
    setAlert("");
    if (!validate()) {
        form.querySelector(".has-error .input").focus();
        return;
    }
    setLoading(true);
    const {data,error}=await sb.auth.signInWithPassword({
        email:email.value.trim(),
        password:password.value,
    });
    if (error) {
        setLoading(false);
        if (error.code==="invalid_credentials") {
            setError("passwordField","Email or password is not correct");
            password.select();
        } else if (error.code==="email_not_confirmed") {
            setError("emailField","Confirm your email first, check your inbox");
        } else {
            setAlert("We couldn't log you in right now. Check your connection and try again.");
            console.error(error);
        }
        return;
    }
    routeSignedInUser(data.user);
});