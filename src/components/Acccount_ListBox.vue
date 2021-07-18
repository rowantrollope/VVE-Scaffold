<!-- This example requires Tailwind CSS v2.0+ -->
<template>
<div>
    <Listbox as="div" v-model="modelValue" @update:modelValue="onUpdate">
        <ListboxLabel class="block text-sm font-medium text-gray-700">
        </ListboxLabel>
        
        <div class="mt-1 relative sm:text-sm">
            <ListboxButton class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <span class="w-full">
                    <div class="grid grid-cols-8">
                        <div class="col-span-6 truncate">
                            {{ modelValue.address }}
                        </div>
                        <div class='col-span-2 text-xs text-right text-gray-500 ml-2'>
                            {{ ethers.utils.commify(modelValue.tokenBalance) }} TOK
                        </div>
                    </div>
                </span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </ListboxButton>

            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                
                <div class="grid grid-cols-8">
                    <div class=" bg-gray-200 pl-3 -mt-1 -mr-1 pt-1 pb-1 col-span-6 truncate" :class="[selected ? 'text-indigo-200' : 'text-gray-500']">
                        Account Address
                    </div>
                    <div class='col-span-2 pr-8 bg-gray-200 -ml-1 pt-1 -mt-1 pb-1 text-right' :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2']">
                        Balance
                    </div>
                </div>

                <ListboxOption as="template" v-for="account in props.accounts" :key="account.address" 
                    :value="account" 
                    v-slot="{ active, selected }">
                    <li :class="[active ? 'text-white bg-indigo-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9']">
                        <div class="grid grid-cols-8">
                            <div class="col-span-6 truncate" :class="[selected ? 'font-semibold' : 'font-normal']">
                                {{ account.address }}
                            </div>
                            <div class='col-span-2 text-right text-xs' :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2']">
                                {{ ethers.utils.commify(account.tokenBalance) }} TOK
                            </div>
                        </div>

                        <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                    </li>
                </ListboxOption>

            </ListboxOptions>
            </transition>
        </div>
    </Listbox>
    </div>
</template>
  
<script setup="props, {emit}" lang="ts">
import { ethers } from 'ethers';

import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'

import Account from '../services/Account';

const props = defineProps<{
    accounts: Array<Account>,
    modelValue: Account,
}>();

const emit = defineEmits(['update:modelValue']);

const onUpdate = (account: Account) => emit('update:modelValue', account);

</script>