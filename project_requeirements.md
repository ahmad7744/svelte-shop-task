AssessmentTask
Createane-commerceappwithSvelte5includingthefollowingfeatures:
1.Homepage
●Twobuttons:"Products"and"Checkout"
●Displayalivecounterofactiveusers(simulatewithrandomupdatesevery5
seconds)
2.ProductsPage
●Fetchproductsfromadummyapi(example:https://fakestoreapi.com/products)
●Implementreal-timesearchwithdebouncing(300ms)
●Pagination(10productsperpage)withURLparameters
●Showloaderwhilefetching
●Preloaddatabeforenavigation
●"AddtoCart"functionality
3.CartManagement
ImplementaCartServicewithMessageQueuepattern:

●Queueprocessescartupdatesasynchronously(simulate500msdelay)
●UIshowsqueuestatus("Addingtocart..."→"Added!")
●Important:NOSveltestoresallowed-useSvelte5Runesorcustomreactive
system
4.CheckoutPage
●Listallproductsincart
●Implementoptimisticupdateswhendeletingitems
●Ratelimiting:Max1checkoutper10seconds(showcountdown)
●Displaytotalprice
●Checkoutbuttonwithsuccessmessage
