<template>
    <div class="content">
        <div class="column column-left">
            <div class="top-fields">
                <div class="text-fields">
                    <v-text-field label="API Key" type="password" v-model="apiKey"></v-text-field>
                    <v-text-field label="Product Id" v-model="productId"></v-text-field>
                </div>
                <v-btn v-on:click="fetchProduct()">Fetch Product</v-btn>
            </div>
            <div>
                <v-btn v-if="product" color="#0a89d0" class="text-white" @click="updateProduct()">Update Product</v-btn>
            </div>
        </div>
        <div class="column column-right">
            <div v-if="product" class="product container">
                <h4 class="text-h4">{{ product.name }}</h4>
                <v-text-field label="Product Id" :disabled=true v-model="product.id"></v-text-field>
                <v-text-field label="Product Name" v-model="product.name"></v-text-field>
                <v-textarea label="Product Description" v-model="product.description"></v-textarea>
                <div class="markdown-preview">
                    <v-btn color="#0a89d0" variant="text" @click="dialog = true; source = product.description">
                        Markdown Preview
                    </v-btn>
                </div>
                <v-text-field label="Product Categories" v-model="product.categories"></v-text-field>
                <div class="variant-title">
                    <div class="text-h6">Variants</div>
                    <v-btn color="#0a89d0" prepend-icon=" mdi-plus" variant="text" @click="addVariant()">Add Variant</v-btn>
                </div>
                <v-expansion-panels multiple=true>
                    <v-expansion-panel v-for="(variant, index) in product.variants" :key="index">
                        <v-expansion-panel-title>
                            {{ variant.name }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-text-field label="Variant Name" v-model="variant.name"></v-text-field>
                            <v-textarea label="Variant Description" v-model="variant.description"></v-textarea>
                            <div class="markdown-preview">
                                <v-btn color="#0a89d0" variant="text" @click="dialog = true; source = variant.description">
                                    Markdown Preview
                                </v-btn>
                            </div>
                            <v-text-field label="Variant Type" v-model="variant.type"></v-text-field>
                            <v-text-field label="Variant Duration" suffix="Days"
                                v-model="variant.durationDays"></v-text-field>
                            <v-text-field label="Instance Count" v-model="variant.instanceCount"></v-text-field>
                            <v-text-field label="Variant Price" prefix="$" v-model="variant.price"></v-text-field>
                            <v-text-field label="Script Id" v-model="variant.scriptId"></v-text-field>
                            <v-btn color="#E53935" class="text-white"
                                @click="deleteVariant(variant); undoSnackbar = true">Delete Variant</v-btn>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
        </div>
    </div>
    <v-dialog v-model="dialog" width="auto">
        <v-card>
            <v-card-text>
                <h4>Markdown Preview</h4>
                <v-sheet elevation="4" height="100%" width="100%" rounded>
                    <div class="markdown-container">
                        <Markdown :source="source"></Markdown>
                    </div>
                </v-sheet>
            </v-card-text>
            <v-card-actions>
                <v-btn color="#0a89d0" block @click="dialog = false">Close Preview</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-snackbar v-model="undoSnackbar" multi-line>
        Variant {{ deleteVariant.name }} Deleted

        <template v-slot:actions>
            <v-btn color="#0a89d0" variant="text" @click="undoSnackbar = false; undoDeleteVariant()">
                Undo
            </v-btn>
        </template>
    </v-snackbar>
    <v-snackbar v-model="successSnackbar" multi-line>
        {{ product.name }} Successfully Updated

        <template v-slot:actions>
            <v-btn color="#0a89d0" variant="text" @click="successSnackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import Markdown from 'vue3-markdown-it';

const emptyVariant = {
    "name": "New variant",
    "description": "Variant description",
    "type": null,
    "durationDays": 30,
    "instanceCount": 1,
    "price": 0,
    "scriptId": 0
};

export default {
    components: {
        Markdown
    },
    data() {
        return {
            apiKey: localStorage.getItem("apiKey"),
            productId: localStorage.getItem("productId"),
            product: null,
            dialog: false,
            undoSnackbar: false,
            successSnackbar: false,
            source: "",
            deletedVariant: null,
            deletedVariantIndex: 0,
        }
    },
    watch: {
        apiKey(newApiKey, oldApiKey) {
            localStorage.setItem("apiKey", newApiKey);
        },
        productId(newProductId, oldProductId) {
            localStorage.setItem("productId", newProductId);
        }
    },
    methods: {
        fetchProduct() {
            const url = `https://api.tribot.org/scripter/v1/products/${this.productId}`;
            const config = {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + this.apiKey
                }
            }
            fetch(url, config)
                .then(res => res.json())
                .then(data => this.product = data)
                .catch(err => console.log(err));
        },
        updateProduct() {
            const invalidVariant = this.product.variants.find(variant => {
                variant.name == emptyVariant.name || variant.description == emptyVariant.description
                    || variant.price == emptyVariant.price || variant.scriptId == emptyVariant.scriptId
            });
            if (invalidVariant) {
                this.deleteVariant(invalidVariant);
            }
            const url = `https://api.tribot.org/scripter/v1/products/${this.product.id}`;
            const config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + this.apiKey
                },
                body: JSON.stringify(this.product)
            }
            fetch(url, config)
                .then(res => this.successSnackbar = res.status == 200)
                .catch(err => console.log(err));
        },
        addVariant() {
            if (!this.product.variants.find(variant => variant.price == 0 || variant.scriptId == 0)) {
                this.product.variants.push({ ...emptyVariant });
            }
        },
        deleteVariant(variant) {
            this.deletedVariantIndex = this.product.variants.findIndex(v => v.scriptId == variant.scriptId && v.name == variant.name);
            this.product.variants.splice(this.deletedVariantIndex, 1);
            this.deletedVariant = variant;
        },
        undoDeleteVariant() {
            if (this.deletedVariant) {
                this.product.variants.splice(this.deletedVariantIndex, 0, this.deletedVariant);
            }
        }
    }
}
</script>

<style>
.content {
    display: flex;
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
}

.column-left {
    flex: 1 1 25%;
    justify-content: space-between;
    background: #eee;
}

.column-right {
    flex: 1 1 75%;
    overflow: auto;
}

.container {
    display: flex;
    flex-direction: column;
}

.top-fields {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 auto;
    width: 100%;
}

.top-fields .text-fields {
    width: 100%;
}

.product {
    width: 100%;
}


h4 {
    margin-bottom: 0.5em;
}

.markdown-preview {
    margin-bottom: 22px;
}

.markdown-container {
    padding: 2em;
}

.variant-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5em;
}
</style>