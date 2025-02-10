// components/DonationButton.tsx

import React from "react"
import Image from "next/image"

const DonationButton = () => {
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
      <p>Find this tool useful? Consider supporting future development:</p>
      <form action="https://www.paypal.com/donate" method="post" target="_top">
        <input type="hidden" name="business" value="WRXZE83VFWE6S" />
        <input type="hidden" name="no_recurring" value="1" />
        <input type="hidden" name="item_name" value="Making simple, free, tools for teachers" />
        <input type="hidden" name="currency_code" value="USD" />
        <input 
          type="image" 
          src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
          name="submit" 
          title="PayPal - The safer, easier way to pay online!" 
          alt="Donate with PayPal button" 
          className="hover:opacity-90 transition-opacity"
        />
        <Image 
          alt=""
          src="https://www.paypal.com/en_US/i/scr/pixel.gif"
          width={1}
          height={1}
          unoptimized
        />
      </form>
    </div>
  )
}

export default DonationButton