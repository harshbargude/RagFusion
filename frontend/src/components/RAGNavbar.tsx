import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { clsx } from "clsx";
import { User, LogIn, LogOut } from "lucide-react"; // Using lucide-react for icons


interface User {
  name: string;
  imageUrl?: string;
}

export interface RAGNavbarProps {
  isLoggedIn: boolean;
  user?: User;
  onLogout?: () => void;
}

interface ListItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, children, href, ...props }, forwardedRef) => (
    <li>
      <NavigationMenuPrimitive.Link
        asChild
        className={clsx(
          "flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          className
        )}
      >
        <a href={href} ref={forwardedRef} {...props}>
          {children}
        </a>
      </NavigationMenuPrimitive.Link>
    </li>
  )
);
ListItem.displayName = "ListItem"; 

interface ListButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ListButton: React.FC<ListButtonProps> = ({ onClick, children, className }) => (
  <li>
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        "text-left text-gray-700 dark:text-gray-100",
        className
      )}
    >
      {children}
    </button>
  </li>
);


export const RAGNavbar: React.FC<RAGNavbarProps> = ({
  isLoggedIn,
  user = { name: "Guest" },
  onLogout,
}) => {
  return (
    <NavigationMenuPrimitive.Root className="relative w-full z-50">
      <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <NavigationMenuPrimitive.List>
          <NavigationMenuPrimitive.Item>
            <NavigationMenuPrimitive.Link
              href="/"
              className="text-lg font-bold text-gray-900 dark:text-white px-3 py-2"
            >
              My RAG App
            </NavigationMenuPrimitive.Link>
          </NavigationMenuPrimitive.Item>
        </NavigationMenuPrimitive.List>

        <NavigationMenuPrimitive.List className="flex items-center space-x-2">
          {isLoggedIn ? (
            <NavigationMenuPrimitive.Item className="relative">
              <NavigationMenuPrimitive.Trigger
                className={clsx(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                )}
              >
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </span>
                )}
              </NavigationMenuPrimitive.Trigger>

              <NavigationMenuPrimitive.Content
                className={clsx(
                  "absolute top-full right-0 w-56 mt-2 z-50",
                  "rounded-lg shadow-lg bg-white dark:bg-gray-800 p-2",
                  "border border-gray-200 dark:border-gray-700",
                  "radix-motion-from-start:animate-enter-from-left",
                  "radix-motion-from-end:animate-enter-from-right",
                  "radix-motion-to-start:animate-exit-to-left",
                  "radix-motion-to-end:animate-exit-to-right"
                )}
              >
                <ul className="flex flex-col space-y-1">
                  <ListItem href="/chat">
                    <User className="w-4 h-4 mr-2" />
                    Chat
                  </ListItem>
                  <ListButton onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </ListButton>
                </ul>
              </NavigationMenuPrimitive.Content>
            </NavigationMenuPrimitive.Item>
          ) : (
            <>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
              <NavigationMenuPrimitive.Item>
                <NavigationMenuPrimitive.Link
                  href="/login"
                  className={clsx(
                    "flex items-center px-3 py-2 text-sm rounded-md",
                    "font-medium text-gray-700 dark:text-gray-100",
                    "hover:bg-gray-100 dark:hover:bg-gray-900",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  )}
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
              <NavigationMenuPrimitive.Item>
                <NavigationMenuPrimitive.Link
                  href="/register"
                  className={clsx(
                    "px-3 py-2 text-sm rounded-md font-medium text-white",
                    "bg-purple-600 hover:bg-purple-700",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  )}
                >
                  Sign Up
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
            </>
          )}
        </NavigationMenuPrimitive.List>
      </div>

      <NavigationMenuPrimitive.Viewport
        className={clsx(
          "absolute top-full left-0 w-full flex justify-end",
          "mt-2 shadow-lg rounded-md bg-transparent overflow-visible z-50",
          "w-radix-navigation-menu-viewport",
          "h-radix-navigation-menu-viewport",
          "radix-state-open:animate-scale-in-content",
          "radix-state-closed:animate-scale-out-content",
          "origin-[top_center] transition-[width_height] duration-300 ease-[ease]"
        )}
      />
    </NavigationMenuPrimitive.Root>
  );
};