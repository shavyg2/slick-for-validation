# @slick-for/validation

[![Build Status](https://travis-ci.com/shavyg2/slick-for-validation.svg?branch=master)](https://travis-ci.com/shavyg2/slick-for-validation)
[![Coverage Status](https://coveralls.io/repos/github/shavyg2/slick-for-validation/badge.svg?branch=master)](https://coveralls.io/github/shavyg2/slick-for-validation?branch=master)


This library allows for enhanced validation with
typescript support.

This gives validation as well as typescript defitions of
the object it performs validation for.


## Seeing is believing (note repl.it is reporting incorrect types at time of publish vs-code reports correctly)


[Online IDE Example](https://repl.it/@ShavauhnGabay/Slick-Validation-Example)

## sync 
eg 
```typescript

const validation = {
    name(name:string,error:string[],{path}){
        if(!is.string(name)){
            error.push(`property ${path} is required`)
        }
    }
}


const [err,person] = ValidationSync({
    name:"Sarah"
},validation)

expect(err).toBeFalsy();
expect(person.name).toBe("Sarah");
```

When person is returned it will have full typescript support.
Autocompletion and everything just from the validation function.


## async 

Some times during validation you really need to validate some 
async process, it makes no real to have to use a different 
function / process to validate async paramters 


eg
```typescript

const validation = {
    async name(name:string,error:string[],{path}){
        if(!is.string(name)){
            error.push(`property ${path} is required`)
        }
    }
}


const [err,person] = await Validation({
    name:"Sarah"
},validation)

expect(err).toBeFalsy();
expect(person.name).toBe("Sarah");

```

this will work just like the sync properties and it will 
have all of the autocompletion on person just like the sync 
method.



## Types
If you want to get your types while developing to use as 
parameters at compile time use.

```typescript

const validation = {
    async name(name:string,error:string[],{path}){
        if(!is.string(name)){
            error.push(`property ${path} is required`)
        }
    }
}


type IPerson = Show<typeof validation>

//same as 

interface IPerson{
    name:string
}
```

This works just as well with nested and async properties.


## Goal

We cannot hope to achieve a type sound system in 
typescript / javascript. However this will bring you 90%
of the way there.

The intent is a simple as this. If you validate it,
you are gauranteed to have the correct types at runtime times
and you will never have your interfaces and validation functions
out of sync.

This normally happens when a typescript interface is not aligned
with your validation. Here since the validation is what provides
the types, you ensure your interfaces are always 100% accurate.





