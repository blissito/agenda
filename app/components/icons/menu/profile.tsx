export const Profile = ({
  fill = "#11151A",
  className,
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.9251 7.33499C15.9269 6.29308 15.515 5.29306 14.7797 4.5548C14.0445 3.81651 13.0461 3.40042 12.0042 3.398L12.004 3.398C10.962 3.40042 9.96367 3.81651 9.22842 4.5548C8.49319 5.29306 8.08123 6.29308 8.08308 7.33499M15.9251 7.33499C15.9272 8.37691 15.5155 9.37703 14.7805 10.1155C14.0454 10.854 13.0472 11.2703 12.0052 11.273H12.005C11.4889 11.2719 10.9781 11.1692 10.5016 10.9707C10.0252 10.7723 9.5926 10.4819 9.22842 10.1162C8.86424 9.75052 8.57565 9.31668 8.37913 8.83946C8.18263 8.36227 8.08203 7.85106 8.08308 7.33499M15.9251 7.33499C15.9251 7.33496 15.9251 7.33493 15.9251 7.3349L15.8751 7.335L15.9251 7.33509C15.9251 7.33506 15.9251 7.33503 15.9251 7.33499ZM8.08308 7.33499C8.08308 7.33503 8.08308 7.33506 8.08308 7.33509L8.13308 7.335L8.08308 7.3349C8.08308 7.33493 8.08308 7.33496 8.08308 7.33499ZM9.83357 14.8699L9.83448 14.8698C11.2754 14.7426 12.7248 14.7416 14.1657 14.8688L14.1658 14.8688L14.6262 14.9088C14.6263 14.9088 14.6264 14.9088 14.6265 14.9088C15.2535 14.9706 15.8765 15.0674 16.4926 15.1989L16.493 15.199C18.0601 15.5212 19.1794 16.0906 19.6739 17.1334C19.8559 17.5181 19.9504 17.9384 19.9504 18.364C19.9504 18.7896 19.8559 19.2099 19.6739 19.5946C19.1784 20.6394 18.0441 21.2128 16.5054 21.5169L16.5049 21.517L16.0387 21.6139C16.0385 21.6139 16.0383 21.614 16.0382 21.614C15.4192 21.7328 14.7935 21.814 14.1647 21.8571L14.1638 21.8572C12.9911 21.957 11.8144 21.9749 10.6788 21.9131L10.6788 21.913L10.6764 21.913L10.3933 21.911L10.2507 21.9051C10.2506 21.9051 10.2505 21.9051 10.2504 21.9051C10.0749 21.896 9.91972 21.8781 9.85819 21.86L9.85853 21.8589L9.84748 21.8581C9.05802 21.8043 8.27456 21.6897 7.52308 21.5202L7.52222 21.52L7.26692 21.4672C7.26679 21.4672 7.26665 21.4671 7.26652 21.4671C5.84414 21.1513 4.8052 20.5835 4.3252 19.5925C4.14283 19.2058 4.04882 18.7834 4.05001 18.3559C4.0512 17.9284 4.14753 17.5066 4.33201 17.121C4.83158 16.1183 6.00886 15.507 7.50016 15.2L7.50057 15.1999C8.26948 15.035 9.04909 14.9247 9.83357 14.8699ZM18.4623 19.0154L18.4623 19.0154C18.6577 18.6019 18.6577 18.1242 18.4623 17.7126C18.3307 17.4348 18.0596 17.1965 17.6797 16.9982C17.2993 16.7996 16.805 16.6386 16.2194 16.5181C15.5072 16.3656 14.7859 16.2633 14.0595 16.2131L14.0485 16.2122C12.6817 16.0918 11.3059 16.0921 9.93917 16.2132C9.21172 16.2639 8.48878 16.3661 7.77577 16.5191C7.21902 16.6343 6.72616 16.8013 6.3397 17.0044C5.95444 17.2068 5.66914 17.448 5.53633 17.7147L5.53631 17.7147L5.53582 17.7158C5.44087 17.9181 5.39157 18.1388 5.39139 18.3623C5.39121 18.5859 5.44016 18.8067 5.53478 19.0092L5.53508 19.0098C5.67113 19.2908 5.94613 19.5311 6.32949 19.7293C6.71334 19.9277 7.21037 20.0864 7.79805 20.202C7.79818 20.202 7.79831 20.202 7.79844 20.2021L8.14979 20.2759L8.15049 20.2761C8.77055 20.3973 9.39741 20.4806 10.0276 20.5257C10.1238 20.5439 10.2212 20.555 10.3191 20.559L10.3202 20.559L10.7133 20.566C11.8294 20.6262 12.9483 20.6088 14.062 20.5139C14.7862 20.4637 15.5044 20.3593 16.2306 20.1979C16.2307 20.1979 16.2308 20.1978 16.2309 20.1978L16.4546 20.1499L16.4551 20.1498C16.9721 20.0326 17.4117 19.8777 17.7526 19.6887C18.093 19.5 18.3391 19.2749 18.4623 19.0154ZM6.74208 7.335C6.74208 4.41641 9.0979 2.05 12.0041 2.05C14.9103 2.05 17.2671 4.41741 17.2671 7.335C17.2671 10.2546 14.9103 12.62 12.0041 12.62C9.0979 12.62 6.74208 10.2546 6.74208 7.335Z"
      fill={fill}
      stroke="white"
      strokeWidth="0.1"
    />
  </svg>
);